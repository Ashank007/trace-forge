
import sys

def trace_code(code: str):
    trace = []
    local_vars = {}
    
    if_line = None
    else_line = None

    lines = code.splitlines()
    for idx, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("if "):
            if_line = idx
        if stripped.startswith("else:"):
            else_line = idx

    def tracer(frame, event, arg):
        if event == "line":
            lineno = frame.f_lineno
            local_copy = dict(frame.f_locals)

            # Decide branch based on line number
            branch = None
            if if_line and else_line:
                if lineno == if_line + 1:
                    branch = "if"
                elif lineno == else_line + 1:
                    branch = "else"

            trace.append({"line": lineno, "locals": local_copy, "branch": branch})
        return tracer

    sys.settrace(tracer)
    try:
        exec(code, {}, local_vars)
    except Exception as e:
        trace.append({"error": str(e)})
    finally:
        sys.settrace(None)

    return trace


