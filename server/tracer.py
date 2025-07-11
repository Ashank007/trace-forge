import sys
import json

def trace_code(code: str):
    trace = []
    local_vars = {}

    def tracer(frame, event, arg):
        if event == "line":
            lineno = frame.f_lineno
            local_copy = dict(frame.f_locals)
            trace.append({"line": lineno, "locals": local_copy})
        return tracer

    sys.settrace(tracer)
    try:
        exec(code, {}, local_vars)
    except Exception as e:
        trace.append({"error": str(e)})
    finally:
        sys.settrace(None)

    return trace

