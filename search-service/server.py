import os
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any

from dotenv import load_dotenv
load_dotenv()


import grpc
import aiohttp
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn
import threading

import search_pb2
import search_pb2_grpc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API key from environment
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
if not TAVILY_API_KEY:
    raise RuntimeError("❌ Missing TAVILY_API_KEY in environment")

TAVILY_API_URL = "https://api.tavily.com/search"

class SearchService(search_pb2_grpc.SearchServicer):
    async def _tavily_search(self, query: str) -> Dict[str, Any]:
        """Call Tavily real API (same as monolithic)."""
        headers = {"Authorization": f"Bearer {TAVILY_API_KEY}"}
        payload = {"query": query}

        async with aiohttp.ClientSession() as session:
            async with session.post(TAVILY_API_URL, json=payload, headers=headers) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"Tavily API failed ({resp.status}): {text}")
                    raise RuntimeError(f"Tavily API failed ({resp.status})")

                data = await resp.json()
                logger.info(f"✅ Tavily response: {data}")

                return {
                    "success": True,
                    "query": query,
                    "results": data.get("results", []),
                    "summary": data.get("summary") or f"Search results for: {query}",
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "tavily_mcp_api"
                }

    async def Search(self, request, context):
        try:
            query = request.query
            result = await self._tavily_search(query)

            return search_pb2.SearchResponse(
                success=result["success"],
                query=result["query"],
                summary=result["summary"],
                timestamp=result["timestamp"],
                source=result["source"],
                results=[
                    search_pb2.SearchResult(
                        title=r.get("title", ""),
                        url=r.get("url", ""),
                        summary=r.get("summary", ""),
                        content=r.get("content", "")
                    )
                    for r in result["results"]
                ]
            )
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return search_pb2.SearchResponse(
                success=False,
                query=request.query,
                summary=f"Error: {str(e)}",
                timestamp=datetime.utcnow().isoformat(),
                source="search-service"
            )


# -------------------- FASTAPI (HTTP) --------------------
app = FastAPI()

@app.post("/search")
async def http_search(payload: Dict[str, str]):
    query = payload.get("query")
    svc = SearchService()
    result = await svc._tavily_search(query)
    return JSONResponse(result)


# -------------------- GRPC SERVER --------------------
async def serve_grpc() -> None:
    server = grpc.aio.server()
    search_pb2_grpc.add_SearchServicer_to_server(SearchService(), server)
    listen_addr = "[::]:50063"
    logger.info(f"🚀 gRPC Search-service running at {listen_addr}")
    server.add_insecure_port(listen_addr)
    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    # Run gRPC in background thread
    def start_grpc():
        asyncio.run(serve_grpc())

    threading.Thread(target=start_grpc, daemon=True).start()

    # Run HTTP server
    uvicorn.run(app, host="0.0.0.0", port=8001)
