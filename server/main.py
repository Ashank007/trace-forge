from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from tracer import trace_code

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/trace")
async def trace(request: Request):
    body = await request.json()
    code = body.get("code", "")
    trace_result = trace_code(code)
    return {"trace": trace_result}

