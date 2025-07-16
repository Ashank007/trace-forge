import ast

class PythonTracer(ast.NodeVisitor):
    def __init__(self):
        self.locals = {}
        self.trace = []

    def trace_code(self, code: str):
        try:
            tree = ast.parse(code)
            code_lines = code.splitlines()
            exec_globals = {}
            exec_locals = {}

            for node in tree.body:
                line_num = node.lineno
                compiled = compile(ast.Module([node], type_ignores=[]), filename="<ast>", mode="exec")
                exec(compiled, exec_globals, exec_locals)
                self.trace.append({
                    "line": line_num,
                    "locals": dict(exec_locals)
                })
            return self.trace
        except Exception as e:
            return [{"line": 0, "locals": {"error": str(e)}}]

