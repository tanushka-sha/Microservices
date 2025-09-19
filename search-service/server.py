import asyncio
import json
from datetime import datetime
from pathlib import Path

import grpc
from concurrent import futures

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

from grpc_tools import protoc  # type: ignore


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=Path(__file__).parent / ".env", case_sensitive=False, extra="ignore")
    tavily_api_key: str = Field(default="", alias="TAVILY_API_KEY")
    grpc_bind: str = Field(default="0.0.0.0:50061", alias="GRPC_BIND")


def _ensure_protos_generated() -> None:
    proto_dir = Path(__file__).parent / "proto"
    proto_file = proto_dir / "search.proto"
    out_dir = Path(__file__).parent
    if not (out_dir / "search_pb2.py").exists() or not (out_dir / "search_pb2_grpc.py").exists():
        protoc.main(
            [
                "",
                f"-I{proto_dir}",
                f"--python_out={out_dir}",
                f"--grpc_python_out={out_dir}",
                str(proto_file),
            ]
        )


_ensure_protos_generated()
import search_pb2  # type: ignore
import search_pb2_grpc  # type: ignore


class SearchService(search_pb2_grpc.SearchServicer):
    def __init__(self, settings: Settings):
        self.settings = settings

    async def _tavily_search(self, query: str, search_depth: str = "basic", max_results: int = 10):
        import aiohttp
        url = "https://api.tavily.com/search"
        headers = {"Authorization": f"Bearer {self.settings.tavily_api_key}", "Content-Type": "application/json"}
        payload = {
            "query": query,
            "search_depth": search_depth,
            "include_answer": True,
            "include_raw_content": False,
            "max_results": max_results,
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as resp:
                data = await resp.json()
                results = []
                for r in data.get("results", []):
                    results.append(
                        {
                            "title": r.get("title", ""),
                            "url": r.get("url", ""),
                            "summary": r.get("content", ""),
                            "content": r.get("content", ""),
                        }
                    )
                return {
                    "success": True,
                    "query": query,
                    "results": results,
                    "summary": data.get("answer", f"Search results for: {query}"),
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "tavily_direct_api",
                }

    async def Search(self, request, context):  # type: ignore
        try:
            raw = await self._tavily_search(request.query or "", request.search_depth or "basic", request.max_results or 10)
            resp = search_pb2.SearchResponse(
                success=bool(raw.get("success")),
                query=raw.get("query", ""),
                results=[
                    search_pb2.SearchResultItem(
                        title=i.get("title", ""), url=i.get("url", ""), summary=i.get("summary", ""), content=i.get("content", "")
                    )
                    for i in raw.get("results", [])
                ],
                summary=raw.get("summary", ""),
                timestamp=raw.get("timestamp", ""),
                source=raw.get("source", ""),
            )
            return resp
        except Exception as e:
            await context.abort(grpc.StatusCode.INTERNAL, f"Search failed: {e}")


async def serve_async(settings: Settings):
    server = grpc.aio.server()
    search_pb2_grpc.add_SearchServicer_to_server(SearchService(settings), server)
    server.add_insecure_port(settings.grpc_bind)
    await server.start()
    print(f"[search-service] gRPC server listening on {settings.grpc_bind}")
    await server.wait_for_termination()


def main():
    settings = Settings()
    asyncio.run(serve_async(settings))


if __name__ == "__main__":
    main()


