import grpc, sys, os
from grpc_tools import protoc

# Paths
proto_path = os.path.join(os.path.dirname(__file__), 'search-service', 'proto')
out_dir = os.path.join(os.path.dirname(__file__), 'search-service')

# Generate protobuf stubs
protoc.main([
    'protoc',
    f'-I{proto_path}',
    f'--python_out={out_dir}',
    f'--grpc_python_out={out_dir}',
    os.path.join(proto_path, 'search.proto'),
])

sys.path.append(out_dir)
import search_pb2, search_pb2_grpc

def test_search():
    # print("🔌 Connecting to search-service at localhost:50062...")
    with grpc.insecure_channel("localhost:50063") as channel:
        stub = search_pb2_grpc.SearchStub(channel)

        # Example RPC call — adjust to whatever is defined in search.proto
        response = stub.Search(search_pb2.QueryRequest(query="test"))
        print("✅ Search response:", response)

if __name__ == "__main__":
    test_search()
