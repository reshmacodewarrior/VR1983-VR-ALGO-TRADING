# api/strategy_editor.py
from fastapi import APIRouter, HTTPException, WebSocket
from fastapi.responses import HTMLResponse
from typing import List

router = APIRouter(prefix="/api/strategy", tags=["strategy_editor"])

# Serve strategy editor UI
@router.get("/editor", response_class=HTMLResponse)
async def strategy_editor():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Trading Strategy Editor</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/codemirror.min.css" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/codemirror.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/mode/javascript/javascript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/mode/python/python.min.js"></script>
    </head>
    <body>
        <div id="app">
            <div class="editor-container">
                <select id="language-selector">
                    <option value="pine_script">Pine Script</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                </select>
                <textarea id="code-editor"></textarea>
                <button onclick="runBacktest()">Run Backtest</button>
            </div>
            <div id="results"></div>
        </div>
        <script>
            // Code editor initialization
            var editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
                mode: "javascript",
                lineNumbers: true,
                theme: "default",
                value: "// Write your strategy here\\n"
            });
                        
            async function runBacktest() {
                const code = editor.getValue();
                const language = document.getElementById('language-selector').value;
                
                // FIXED ENDPOINT - match your actual API structure
                const response = await fetch('/api/strategy/backtest', {  // CHANGED THIS LINE
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        strategy_code: code,
                        language: language,
                        symbol: 'AAPL',
                        timeframe: '1d', 
                        start_date: '2023-01-01',
                        end_date: '2023-12-31'
                    })
                });
                
                const results = await response.json();
                displayResults(results);
            }
            
            function displayResults(results) {
                document.getElementById('results').innerHTML = 
                    '<pre>' + JSON.stringify(results, null, 2) + '</pre>';
            }
        </script>
    </body>
    </html>
    """

@router.websocket("/ws/editor/{user_id}")
async def websocket_editor(websocket: WebSocket, user_id: str):
    """WebSocket for real-time strategy editing and collaboration"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Handle real-time code updates, syntax checking, etc.
            await websocket.send_text(f"Code updated: {data}")
    except Exception as e:
        print(f"WebSocket error: {e}")