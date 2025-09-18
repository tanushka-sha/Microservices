import asyncio
import json
import os
from typing import Optional

import grpc
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

from concurrent import futures


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore", populate_by_name=True)

    database_url: str = Field(default="postgresql+psycopg2://postgres:tanu1234@localhost:5432/ai_content_db", alias="DATABASE_URL")
    jwt_secret_key: str = Field(default="your-super-secret-jwt-key-here", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=10, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    grpc_bind: str = Field(default="0.0.0.0:50051", alias="GRPC_BIND")


settings = Settings()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# DB models replicated minimal for users
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Boolean

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(claims: dict) -> str:
    return jwt.encode(claims, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


# gRPC generated imports (runtime codegen if not present)
def _ensure_protos_generated() -> None:
    try:
        import auth_pb2  # type: ignore
        import auth_pb2_grpc  # type: ignore
        return
    except Exception:
        pass
    from grpc_tools import protoc
    proto_in = os.path.join(os.path.dirname(__file__), "proto", "auth.proto")
    out_dir = os.path.dirname(__file__)
    protoc.main([
        "protoc",
        f"-I{os.path.dirname(proto_in)}",
        f"--python_out={out_dir}",
        f"--grpc_python_out={out_dir}",
        proto_in,
    ])


_ensure_protos_generated()
import auth_pb2  # type: ignore
import auth_pb2_grpc  # type: ignore


class AuthService(auth_pb2_grpc.AuthServicer):
    def SignUp(self, request, context):
        db: Session = SessionLocal()
        try:
            existing = db.query(User).filter(User.email == request.email).first()
            if existing:
                context.abort(grpc.StatusCode.ALREADY_EXISTS, "Email already registered")

            # username policy: derive from email before '@' if not provided
            username = request.name or request.email.split("@")[0]
            if db.query(User).filter(User.username == username).first():
                context.abort(grpc.StatusCode.ALREADY_EXISTS, "Username already taken")

            user = User(
                email=request.email,
                username=username,
                hashed_password=get_password_hash(request.password),
                role="user",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            token = create_access_token({"sub": user.email, "user_id": user.id})
            return auth_pb2.AuthResponse(user_id=str(user.id), access_token=token)
        finally:
            db.close()

    def Login(self, request, context):
        db: Session = SessionLocal()
        try:
            user: Optional[User] = db.query(User).filter(User.email == request.email).first()
            if not user or not verify_password(request.password, user.hashed_password):
                context.abort(grpc.StatusCode.UNAUTHENTICATED, "Incorrect email or password")
            if not user.is_active:
                context.abort(grpc.StatusCode.FAILED_PRECONDITION, "Inactive user")

            token = create_access_token({"sub": user.email, "user_id": user.id})
            return auth_pb2.AuthResponse(user_id=str(user.id), access_token=token)
        finally:
            db.close()

    def ValidateToken(self, request, context):
        try:
            claims = jwt.decode(request.token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
            user_id = str(claims.get("user_id")) if claims else ""
            return auth_pb2.ValidateResponse(valid=True, user_id=user_id, claims_json=json.dumps(claims))
        except Exception:
            return auth_pb2.ValidateResponse(valid=False, user_id="", claims_json="{}")


async def serve_async() -> None:
    server = grpc.aio.server(options=[("grpc.max_send_message_length", 20 * 1024 * 1024), ("grpc.max_receive_message_length", 20 * 1024 * 1024)])
    auth_pb2_grpc.add_AuthServicer_to_server(AuthService(), server)
    server.add_insecure_port(settings.grpc_bind)
    await server.start()
    print(f"Auth gRPC server listening on {settings.grpc_bind}")
    await server.wait_for_termination()


if __name__ == "__main__":
    try:
        asyncio.run(serve_async())
    except KeyboardInterrupt:
        pass


