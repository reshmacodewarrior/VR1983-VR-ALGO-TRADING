# generate_all_docs.py
from auto_documenter import FastAPIAutoDocumenter

def main():
    print("🚀 Generating VR1983 Trading Automation Documentation...")
    
    # Generate code documentation
    documenter = FastAPIAutoDocumenter(".")
    documenter.analyze_project_structure()
    documenter.extract_module_documentation()
    documenter.generate_markdown_docs("FULL_PROJECT_DOCUMENTATION.md")
    documenter.generate_json_docs("project_structure.json")
    
    print("✅ All documentation generated successfully!")
    print("📁 FULL_PROJECT_DOCUMENTATION.md - Complete project docs")
    print("📁 project_structure.json - Structured data")
    print("🌐 Visit http://localhost:8000/docs for interactive API docs")

if __name__ == "__main__":
    main()