# app/utils/auto_documenter.py
import inspect
import os
from pathlib import Path
from typing import Dict, List, Any
import json

class FastAPIAutoDocumenter:
    """Automatically generate documentation for FastAPI projects"""
    
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.documentation = {
            "project": {},
            "modules": [],
            "endpoints": [],
            "models": [],
            "services": []
        }
    
    def analyze_project_structure(self):
        """Analyze the complete project structure"""
        self.documentation["project"] = {
            "name": "VR1983 Trading Automation",
            "description": "Algorithmic trading platform with user-specific watchlists",
            "structure": self._get_directory_structure()
        }
    
    def _get_directory_structure(self) -> Dict[str, Any]:
        """Get the complete directory structure"""
        structure = {}
        
        for item in self.project_root.rglob("*"):
            if any(part.startswith('.') for part in item.parts) or item.name == '__pycache__':
                continue
            
            relative_path = item.relative_to(self.project_root)
            if item.is_file():
                structure[str(relative_path)] = "file"
            else:
                structure[str(relative_path)] = "directory"
        
        return structure
    
    def extract_module_documentation(self):
        """Extract documentation from all Python modules"""
        for py_file in self.project_root.rglob("*.py"):
            if any(part.startswith('.') or part == '__pycache__' for part in py_file.parts):
                continue
            
            module_docs = self._analyze_python_file(py_file)
            if module_docs:
                self.documentation["modules"].append(module_docs)
    
    def _analyze_python_file(self, file_path: Path) -> Dict[str, Any]:
        """Analyze a single Python file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Simple analysis - you can extend this with ast module
            lines = content.split('\n')
            functions = []
            classes = []
            imports = []
            
            for i, line in enumerate(lines):
                line = line.strip()
                
                if line.startswith('def '):
                    func_name = line.split('def ')[1].split('(')[0]
                    functions.append({
                        'name': func_name,
                        'line': i + 1,
                        'docstring': self._extract_docstring(lines, i)
                    })
                
                elif line.startswith('class '):
                    class_name = line.split('class ')[1].split('(')[0].split(':')[0]
                    classes.append({
                        'name': class_name,
                        'line': i + 1,
                        'docstring': self._extract_docstring(lines, i)
                    })
                
                elif line.startswith(('import ', 'from ')):
                    imports.append(line)
            
            return {
                'file_path': str(file_path.relative_to(self.project_root)),
                'functions': functions,
                'classes': classes,
                'imports': imports,
                'line_count': len(lines)
            }
            
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            return None
    
    def _extract_docstring(self, lines: List[str], start_line: int) -> str:
        """Extract docstring from function or class"""
        docstring = ""
        in_docstring = False
        
        for i in range(start_line + 1, len(lines)):
            line = lines[i].strip()
            
            if line.startswith('"""') or line.startswith("'''"):
                if not in_docstring:
                    in_docstring = True
                    docstring = line.replace('"""', '').replace("'''", '')
                else:
                    docstring += ' ' + line.replace('"""', '').replace("'''", '')
                    break
            elif in_docstring:
                docstring += ' ' + line
        
        return docstring.strip() if docstring else "No documentation"
    
    def generate_markdown_docs(self, output_file: str = "PROJECT_DOCUMENTATION.md"):
        """Generate comprehensive markdown documentation"""
        
        docs = []
        docs.append("# VR1983 Trading Automation - Project Documentation\n")
        
        # Project Overview
        docs.append("## Project Overview")
        docs.append("**Name:** VR1983 Trading Automation")
        docs.append("**Description:** Algorithmic trading platform with real-time signals and user watchlists")
        docs.append("**Architecture:** FastAPI + MongoDB + Background Scheduler")
        docs.append("\n---\n")
        
        # Project Structure
        docs.append("## Project Structure")
        for path, type_ in self.documentation["project"]["structure"].items():
            icon = "📁" if type_ == "directory" else "📄"
            docs.append(f"{icon} `{path}`")
        
        docs.append("\n---\n")
        
        # Modules Documentation
        docs.append("## Modules & Components\n")
        
        for module in self.documentation["modules"]:
            docs.append(f"### `{module['file_path']}`")
            docs.append(f"**Lines:** {module['line_count']}")
            
            if module['classes']:
                docs.append("\n#### Classes:")
                for cls in module['classes']:
                    docs.append(f"- **{cls['name']}** (Line {cls['line']})")
                    docs.append(f"  - {cls['docstring']}")
            
            if module['functions']:
                docs.append("\n#### Functions:")
                for func in module['functions']:
                    docs.append(f"- **{func['name']}** (Line {func['line']})")
                    docs.append(f"  - {func['docstring']}")
            
            docs.append("\n---\n")
        
        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(docs))
        
        print(f"✅ Comprehensive documentation generated: {output_file}")
    
    def generate_json_docs(self, output_file: str = "project_docs.json"):
        """Generate JSON documentation for programmatic use"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.documentation, f, indent=2, ensure_ascii=False)
        
        print(f"✅ JSON documentation generated: {output_file}")

# Usage
if __name__ == "__main__":
    documenter = FastAPIAutoDocumenter(".")
    documenter.analyze_project_structure()
    documenter.extract_module_documentation()
    documenter.generate_markdown_docs()
    documenter.generate_json_docs()