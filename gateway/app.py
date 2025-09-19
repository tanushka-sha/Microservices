import os
import json
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import grpc
from pathlib import Path
from grpc_tools import protoc  # type: ignore


def _ensure_protos_generated() -> None:
    proto_dir = Path(__file__).parent.parent / "search-service" / "proto"
    proto_file = proto_dir / "search.proto"
    out_dir = Path(__file__).parent
    if not (out_dir / "search_pb2.py").exists() or not (out_dir / "search_pb2_grpc.py").exists():
        protoc.main([
            "",
            f"-I{proto_dir}",
            f"--python_out={out_dir}",
            f"--grpc_python_out={out_dir}",
            str(proto_file),
        ])


_ensure_protos_generated()
# Ensure gateway dir is importable so generated stubs can be imported as top-level modules
sys.path.insert(0, str(Path(__file__).parent.resolve()))
import search_pb2  # type: ignore
import search_pb2_grpc  # type: ignore


SEARCH_GRPC_ADDR = os.getenv("SEARCH_GRPC_ADDR", "localhost:50063")

app = FastAPI(title="API Gateway")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/search")
async def gateway_search(payload: dict):
    query = (payload or {}).get("query", "")
    try:
        async with grpc.aio.insecure_channel(SEARCH_GRPC_ADDR) as channel:  # type: ignore
            stub = search_pb2_grpc.SearchStub(channel)
            req = search_pb2.QueryRequest(query=query, search_depth="basic", max_results=10)
            resp = await stub.Search(req)
            # Map to the monolith expected shape
            return {
                "success": resp.success,
                "query": resp.query,
                "results": [
                    {"title": r.title, "url": r.url, "summary": r.summary, "content": r.content}
                    for r in resp.results
                ],
                "summary": resp.summary,
                "timestamp": resp.timestamp,
                "source": resp.source,
            }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gateway search failed: {e}")


