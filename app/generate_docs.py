# generate_docs.py
import os
import ast
import inspect
from typing import List, Dict, Any
from pathlib import Path

def extract_fastapi_routes(app_file: str) -> List[Dict[str, Any]]:
    """Extract FastAPI routes and their documentation"""
    routes = []
    
    with open(app_file, 'r', encoding='utf-8') as file:
        tree = ast.parse(file.read())
    
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            # Look for route decorators
            for decorator in node.decorator_list:
                if (isinstance(decorator, ast.Call) and 
                    isinstance(decorator.func, ast.Attribute) and
                    decorator.func.attr in ['get', 'post', 'put', 'delete', 'patch']):
                    
                    route_info = {
                        'name': node.name,
                        'method': decorator.func.attr.upper(),
                        'docstring': ast.get_docstring(node) or 'No documentation',
                        'line_number': node.lineno
                    }
                    routes.append(route_info)
    
    return routes

def generate_api_documentation(project_path: str) -> str:
    """Generate comprehensive API documentation"""
    
    docs = []
    docs.append("# VR1983 Trading Automation API Documentation\n")
    docs.append("## API Endpoints\n")
    
    # Find all Python files
    for py_file in Path(project_path).rglob("*.py"):
        if any(part.startswith('.') or part == '__pycache__' for part in py_file.parts):
            continue
            
        routes = extract_fastapi_routes(str(py_file))
        if routes:
            docs.append(f"### {py_file}\n")
            
            for route in routes:
                docs.append(f"#### `{route['method']}` {route['name']}")
                docs.append(f"**File:** `{py_file}` (Line {route['line_number']})")
                docs.append(f"**Description:** {route['docstring']}")
                docs.append("---\n")
    
    return "\n".join(docs)

# Generate documentation
if __name__ == "__main__":
    project_path = "."
    documentation = generate_api_documentation(project_path)
    
    with open("API_DOCUMENTATION.md", "w", encoding="utf-8") as f:
        f.write(documentation)
    
    print("✅ Documentation generated: API_DOCUMENTATION.md")