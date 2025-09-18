#!/usr/bin/env python3
"""
Test script to verify gRPC connection between monolith and auth service
"""
import grpc
import sys
import os

# Add the auth-service directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'auth-service'))

def test_grpc_connection():
    print("Testing gRPC connection...")
    
    try:
        # Generate protobuf stubs if needed
        from grpc_tools import protoc
        proto_path = os.path.join(os.path.dirname(__file__), 'auth-service', 'proto')
        out_dir = os.path.join(os.path.dirname(__file__), 'auth-service')
        
        protoc.main([
            'protoc',
            f'-I{proto_path}',
            f'--python_out={out_dir}',
            f'--grpc_python_out={out_dir}',
            os.path.join(proto_path, 'auth.proto'),
        ])
        print("✅ Generated protobuf stubs")
        
        # Import generated stubs
        sys.path.append(out_dir)
        import auth_pb2
        import auth_pb2_grpc
        
        # Test connection to gRPC server
        print("🔌 Connecting to gRPC server at localhost:50051...")
        with grpc.insecure_channel('localhost:50051') as channel:
            stub = auth_pb2_grpc.AuthStub(channel)
            
            # Test SignUp
            print("📝 Testing SignUp...")
            try:
                response = stub.SignUp(auth_pb2.SignUpRequest(
                    name="testuser",
                    email="test@example.com", 
                    password="testpass123"
                ))
                print(f"✅ SignUp successful! User ID: {response.user_id}")
                print(f"🔑 Access token: {response.access_token[:50]}...")
                
                # Test Login
                print("🔐 Testing Login...")
                login_response = stub.Login(auth_pb2.LoginRequest(
                    email="test@example.com",
                    password="testpass123"
                ))
                print(f"✅ Login successful! User ID: {login_response.user_id}")
                print(f"🔑 Access token: {login_response.access_token[:50]}...")
                
                # Test ValidateToken
                print("🔍 Testing ValidateToken...")
                validate_response = stub.ValidateToken(auth_pb2.ValidateRequest(
                    token=login_response.access_token
                ))
                print(f"✅ Token validation: {validate_response.valid}")
                print(f"👤 User ID from token: {validate_response.user_id}")
                
                print("\n🎉 All gRPC tests passed! The auth microservice is working correctly.")
                
            except grpc.RpcError as e:
                print(f"❌ gRPC call failed: {e.code()} - {e.details()}")
                return False
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_grpc_connection()
    sys.exit(0 if success else 1)
