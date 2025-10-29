# VR1983 Trading Automation - Project Documentation

## Project Overview
**Name:** VR1983 Trading Automation
**Description:** Algorithmic trading platform with real-time signals and user watchlists
**Architecture:** FastAPI + MongoDB + Background Scheduler

---

## Project Structure
📁 `api`
📄 `utils.py`
📁 `test`
📄 `secret.py`
📄 `kite_password.png`
📄 `main.py`
📁 `templates`
📁 `database`
📄 `stock_dashboard.py`
📄 `config.py`
📄 `generate_docs.py`
📄 `app.log`
📁 `schemas`
📄 `test_token.py`
📄 `admin_password.jpeg`
📁 `scripts`
📁 `static`
📁 `middleware`
📄 `algo.py`
📄 `manager_password.jpeg`
📄 `generate_all_docs.py`
📁 `services`
📄 `requirements.txt`
📄 `exceptions.py`
📄 `auto_documenter.py`
📄 `api/order.py`
📄 `api/strategy_management.py`
📄 `api/watchlist.py`
📄 `api/csv_file.py`
📄 `api/strategy_marketplace.py`
📄 `api/market.py`
📄 `api/signal.py`
📄 `api/levels.py`
📄 `api/broker.py`
📄 `api/user.py`
📄 `api/strategy_backtest.py`
📄 `api/upstox.py`
📄 `api/password.py`
📄 `api/strategy_editor.py`
📄 `api/routes.py`
📄 `test/test_market.py`
📄 `templates/index.html`
📄 `templates/login.html`
📄 `templates/brokerage_select.html`
📄 `templates/Candle.js`
📄 `database/collections.py`
📄 `database/connection.py`
📄 `schemas/order.py`
📄 `schemas/market.py`
📄 `schemas/signal.py`
📄 `schemas/preference.py`
📄 `schemas/broker.py`
📄 `schemas/user.py`
📄 `schemas/notification.py`
📄 `schemas/strategy.py`
📄 `__pycache__/exceptions.cpython-312.pyc`
📄 `__pycache__/utils.cpython-312.pyc`
📄 `__pycache__/__init__.cpython-312.pyc`
📄 `__pycache__/auto_documenter.cpython-312.pyc`
📄 `__pycache__/config.cpython-312.pyc`
📄 `__pycache__/main.cpython-312.pyc`
📄 `scripts/migrate_roles.py`
📁 `static/css`
📄 `middleware/role_middleware.py`
📄 `services/real_trading_executor.py`
📄 `services/storage.py`
📄 `services/market.py`
📄 `services/scheduler.py`
📄 `services/trade.py`
📄 `services/strategy_executor.py`
📄 `services/signal.py`
📄 `services/levels.py`
📄 `services/csv_service.py`
📄 `services/algo_service.py`
📄 `services/backtest_engine.py`
📄 `services/strategy_templates.py`
📄 `services/user.py`
📄 `services/weekly (2).xlsx`
📄 `services/price_algorithm.py`
📄 `services/enhanced_algorithm.py`
📄 `services/live_strategy_monitor.py`
📄 `api/__pycache__/orders.cpython-312.pyc`
📄 `api/__pycache__/stock.cpython-312.pyc`
📄 `api/__pycache__/strategy_management.cpython-312.pyc`
📄 `api/__pycache__/auth.cpython-312.pyc`
📄 `api/__pycache__/__init__.cpython-312.pyc`
📄 `api/__pycache__/csv_file.cpython-312.pyc`
📄 `api/__pycache__/user.cpython-312.pyc`
📄 `api/__pycache__/password.cpython-312.pyc`
📄 `api/__pycache__/strategy_backtest.cpython-312.pyc`
📄 `api/__pycache__/strategy_marketplace.cpython-312.pyc`
📄 `api/__pycache__/trade.cpython-312.pyc`
📄 `api/__pycache__/routers.cpython-312.pyc`
📄 `api/__pycache__/order.cpython-312.pyc`
📄 `api/__pycache__/broker.cpython-312.pyc`
📄 `api/__pycache__/markets.cpython-312.pyc`
📄 `api/__pycache__/strategy_editor.cpython-312.pyc`
📄 `api/__pycache__/upstox.cpython-312.pyc`
📄 `api/__pycache__/signal.cpython-312.pyc`
📄 `api/__pycache__/market.cpython-312.pyc`
📄 `api/__pycache__/watchlist.cpython-312.pyc`
📄 `api/__pycache__/levels.cpython-312.pyc`
📄 `api/__pycache__/routes.cpython-312.pyc`
📄 `test/__pycache__/test_market.cpython-312-pytest-8.4.1.pyc`
📄 `database/__pycache__/__init__.cpython-312.pyc`
📄 `database/__pycache__/connection.cpython-312.pyc`
📄 `database/__pycache__/collections.cpython-312.pyc`
📄 `schemas/__pycache__/orders.cpython-312.pyc`
📄 `schemas/__pycache__/__init__.cpython-312.pyc`
📄 `schemas/__pycache__/strategy.cpython-312.pyc`
📄 `schemas/__pycache__/user.cpython-312.pyc`
📄 `schemas/__pycache__/trade.cpython-312.pyc`
📄 `schemas/__pycache__/order.cpython-312.pyc`
📄 `schemas/__pycache__/broker.cpython-312.pyc`
📄 `static/css/index.css`
📄 `middleware/__pycache__/role_middleware.cpython-312.pyc`
📄 `services/__pycache__/orders.cpython-312.pyc`
📄 `services/__pycache__/storage.cpython-312.pyc`
📄 `services/__pycache__/fake_algorithm.cpython-312.pyc`
📄 `services/__pycache__/backtest_engine.cpython-312.pyc`
📄 `services/__pycache__/enhanced_algorithm.cpython-312.pyc`
📄 `services/__pycache__/user.cpython-312.pyc`
📄 `services/__pycache__/price_algorithm.cpython-312.pyc`
📄 `services/__pycache__/trade.cpython-312.pyc`
📄 `services/__pycache__/algo_service.cpython-312.pyc`
📄 `services/__pycache__/signal.cpython-312.pyc`
📄 `services/__pycache__/market.cpython-312.pyc`
📄 `services/__pycache__/scheduler.cpython-312.pyc`

---

## Modules & Components

### `utils.py`
**Lines:** 25

---

### `secret.py`
**Lines:** 8

---

### `main.py`
**Lines:** 59

---

### `stock_dashboard.py`
**Lines:** 410

#### Classes:
- **GlobalStockDashboard** (Line 58)
  - Load Indian stock symbols with their names indian_stocks = { 'RELIANCE.NS': 'Reliance Industries', 'TATAMOTORS.NS': 'Tata Motors', 'INFY.NS': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'TCS.NS': 'Tata Consultancy Services', 'ICICIBANK.NS': 'ICICI Bank', 'HINDUNILVR.NS': 'Hindustan Unilever', 'SBIN.NS': 'State Bank of India', 'BAJFINANCE.NS': 'Bajaj Finance', 'KOTAKBANK.NS': 'Kotak Mahindra Bank', 'ITC.NS': 'ITC Limited', 'LT.NS': 'Larsen & Toubro', 'AXISBANK.NS': 'Axis Bank', 'BHARTIARTL.NS': 'Bharti Airtel', 'MARUTI.NS': 'Maruti Suzuki', 'ASIANPAINT.NS': 'Asian Paints', 'HINDALCO.NS': 'Hindalco Industries', 'SUNPHARMA.NS': 'Sun Pharmaceutical', 'TITAN.NS': 'Titan Company', 'POWERGRID.NS': 'Power Grid Corporation', 'NTPC.NS': 'NTPC Limited', 'ONGC.NS': 'Oil & Natural Gas Corporation', 'WIPRO.NS': 'Wipro', 'ADANIPORTS.NS': 'Adani Ports', 'ULTRACEMCO.NS': 'UltraTech Cement', 'JSWSTEEL.NS': 'JSW Steel', 'TECHM.NS': 'Tech Mahindra', 'GRASIM.NS': 'Grasim Industries', 'HCLTECH.NS': 'HCL Technologies', 'DRREDDY.NS': 'Dr. Reddy\'s Laboratories', 'INDUSINDBK.NS': 'IndusInd Bank', 'CIPLA.NS': 'Cipla', 'BAJAJFINSV.NS': 'Bajaj Finserv', 'TATASTEEL.NS': 'Tata Steel', 'HEROMOTOCO.NS': 'Hero MotoCorp', 'COALINDIA.NS': 'Coal India', 'BPCL.NS': 'Bharat Petroleum', 'EICHERMOT.NS': 'Eicher Motors', 'DIVISLAB.NS': 'Divi\'s Laboratories', 'BRITANNIA.NS': 'Britannia Industries', 'SBILIFE.NS': 'SBI Life Insurance', 'HDFCLIFE.NS': 'HDFC Life Insurance', 'UPL.NS': 'UPL Limited', 'VEDL.NS': 'Vedanta Limited', 'SHREECEM.NS': 'Shree Cement', 'HINDPETRO.NS': 'Hindustan Petroleum', 'IOC.NS': 'Indian Oil Corporation', 'GAIL.NS': 'GAIL India', 'M&M.NS': 'Mahindra & Mahindra' } return indian_stocks  def fetch_stock_data(self, symbol, period="1d", interval="1d"): Fetch stock data with error handling

#### Functions:
- **__init__** (Line 59)
  - Load Indian stock symbols with their names indian_stocks = { 'RELIANCE.NS': 'Reliance Industries', 'TATAMOTORS.NS': 'Tata Motors', 'INFY.NS': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'TCS.NS': 'Tata Consultancy Services', 'ICICIBANK.NS': 'ICICI Bank', 'HINDUNILVR.NS': 'Hindustan Unilever', 'SBIN.NS': 'State Bank of India', 'BAJFINANCE.NS': 'Bajaj Finance', 'KOTAKBANK.NS': 'Kotak Mahindra Bank', 'ITC.NS': 'ITC Limited', 'LT.NS': 'Larsen & Toubro', 'AXISBANK.NS': 'Axis Bank', 'BHARTIARTL.NS': 'Bharti Airtel', 'MARUTI.NS': 'Maruti Suzuki', 'ASIANPAINT.NS': 'Asian Paints', 'HINDALCO.NS': 'Hindalco Industries', 'SUNPHARMA.NS': 'Sun Pharmaceutical', 'TITAN.NS': 'Titan Company', 'POWERGRID.NS': 'Power Grid Corporation', 'NTPC.NS': 'NTPC Limited', 'ONGC.NS': 'Oil & Natural Gas Corporation', 'WIPRO.NS': 'Wipro', 'ADANIPORTS.NS': 'Adani Ports', 'ULTRACEMCO.NS': 'UltraTech Cement', 'JSWSTEEL.NS': 'JSW Steel', 'TECHM.NS': 'Tech Mahindra', 'GRASIM.NS': 'Grasim Industries', 'HCLTECH.NS': 'HCL Technologies', 'DRREDDY.NS': 'Dr. Reddy\'s Laboratories', 'INDUSINDBK.NS': 'IndusInd Bank', 'CIPLA.NS': 'Cipla', 'BAJAJFINSV.NS': 'Bajaj Finserv', 'TATASTEEL.NS': 'Tata Steel', 'HEROMOTOCO.NS': 'Hero MotoCorp', 'COALINDIA.NS': 'Coal India', 'BPCL.NS': 'Bharat Petroleum', 'EICHERMOT.NS': 'Eicher Motors', 'DIVISLAB.NS': 'Divi\'s Laboratories', 'BRITANNIA.NS': 'Britannia Industries', 'SBILIFE.NS': 'SBI Life Insurance', 'HDFCLIFE.NS': 'HDFC Life Insurance', 'UPL.NS': 'UPL Limited', 'VEDL.NS': 'Vedanta Limited', 'SHREECEM.NS': 'Shree Cement', 'HINDPETRO.NS': 'Hindustan Petroleum', 'IOC.NS': 'Indian Oil Corporation', 'GAIL.NS': 'GAIL India', 'M&M.NS': 'Mahindra & Mahindra' } return indian_stocks  def fetch_stock_data(self, symbol, period="1d", interval="1d"): Fetch stock data with error handling
- **load_indian_stocks** (Line 72)
  - Load Indian stock symbols with their names indian_stocks = { 'RELIANCE.NS': 'Reliance Industries', 'TATAMOTORS.NS': 'Tata Motors', 'INFY.NS': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'TCS.NS': 'Tata Consultancy Services', 'ICICIBANK.NS': 'ICICI Bank', 'HINDUNILVR.NS': 'Hindustan Unilever', 'SBIN.NS': 'State Bank of India', 'BAJFINANCE.NS': 'Bajaj Finance', 'KOTAKBANK.NS': 'Kotak Mahindra Bank', 'ITC.NS': 'ITC Limited', 'LT.NS': 'Larsen & Toubro', 'AXISBANK.NS': 'Axis Bank', 'BHARTIARTL.NS': 'Bharti Airtel', 'MARUTI.NS': 'Maruti Suzuki', 'ASIANPAINT.NS': 'Asian Paints', 'HINDALCO.NS': 'Hindalco Industries', 'SUNPHARMA.NS': 'Sun Pharmaceutical', 'TITAN.NS': 'Titan Company', 'POWERGRID.NS': 'Power Grid Corporation', 'NTPC.NS': 'NTPC Limited', 'ONGC.NS': 'Oil & Natural Gas Corporation', 'WIPRO.NS': 'Wipro', 'ADANIPORTS.NS': 'Adani Ports', 'ULTRACEMCO.NS': 'UltraTech Cement', 'JSWSTEEL.NS': 'JSW Steel', 'TECHM.NS': 'Tech Mahindra', 'GRASIM.NS': 'Grasim Industries', 'HCLTECH.NS': 'HCL Technologies', 'DRREDDY.NS': 'Dr. Reddy\'s Laboratories', 'INDUSINDBK.NS': 'IndusInd Bank', 'CIPLA.NS': 'Cipla', 'BAJAJFINSV.NS': 'Bajaj Finserv', 'TATASTEEL.NS': 'Tata Steel', 'HEROMOTOCO.NS': 'Hero MotoCorp', 'COALINDIA.NS': 'Coal India', 'BPCL.NS': 'Bharat Petroleum', 'EICHERMOT.NS': 'Eicher Motors', 'DIVISLAB.NS': 'Divi\'s Laboratories', 'BRITANNIA.NS': 'Britannia Industries', 'SBILIFE.NS': 'SBI Life Insurance', 'HDFCLIFE.NS': 'HDFC Life Insurance', 'UPL.NS': 'UPL Limited', 'VEDL.NS': 'Vedanta Limited', 'SHREECEM.NS': 'Shree Cement', 'HINDPETRO.NS': 'Hindustan Petroleum', 'IOC.NS': 'Indian Oil Corporation', 'GAIL.NS': 'GAIL India', 'M&M.NS': 'Mahindra & Mahindra' } return indian_stocks  def fetch_stock_data(self, symbol, period="1d", interval="1d"): Fetch stock data with error handling
- **fetch_stock_data** (Line 127)
  - Fetch stock data with error handling try: stock = yf.Ticker(symbol) hist = stock.history(period=period, interval=interval)  if hist.empty: return None  info = stock.info prev_close = info.get('previousClose', hist['Close'].iloc[-2] if len(hist) > 1 else hist['Close'].iloc[-1])  current_price = hist['Close'].iloc[-1] change = current_price - prev_close change_percent = (change / prev_close) * 100  stock_name = self.indian_stocks.get(symbol, info.get('longName', symbol))  return { 'history': hist, 'current_price': current_price, 'prev_close': prev_close, 'change': change, 'change_percent': change_percent, 'high': hist['High'].max(), 'low': hist['Low'].min(), 'volume': hist['Volume'].sum(), 'symbol': symbol, 'name': stock_name, 'currency': info.get('currency', 'USD'), 'last_updated': datetime.now() } except Exception as e: return None  def fetch_bulk_data(self, symbols, max_workers=10): Fetch data for multiple symbols quickly
- **fetch_bulk_data** (Line 162)
  - Fetch data for multiple symbols quickly results = {} for symbol in symbols: data = self.fetch_stock_data(symbol, period="1d", interval="1d") if data: results[symbol] = data return results  def create_candlestick_chart(self, data, symbol): Create professional candlestick chart
- **create_candlestick_chart** (Line 171)
  - Create professional candlestick chart fig = make_subplots( rows=2, cols=1, shared_xaxes=True, vertical_spacing=0.1, subplot_titles=(f'{symbol} Price', 'Volume'), row_width=[0.7, 0.3] )  # Candlestick chart fig.add_trace(go.Candlestick( x=data.index, open=data['Open'], high=data['High'], low=data['Low'], close=data['Close'], name='Price', increasing_line_color='#2ecc71', decreasing_line_color='#e74c3c' ), row=1, col=1)  # Volume bars colors = ['#2ecc71' if data['Close'].iloc[i] >= data['Open'].iloc[i] else '#e74c3c' for i in range(len(data))]  fig.add_trace(go.Bar( x=data.index, y=data['Volume'], name='Volume', marker_color=colors, opacity=0.7 ), row=2, col=1)  # Update layout fig.update_layout( height=600, showlegend=False, xaxis_rangeslider_visible=False, template='plotly_white', margin=dict(l=50, r=50, t=80, b=50), title=f"{symbol} - Candlestick Chart" )  fig.update_yaxes(title_text="Price", row=1, col=1) fig.update_yaxes(title_text="Volume", row=2, col=1) fig.update_xaxes(title_text="Date", row=2, col=1)  return fig  def main(): st.markdown('<h1 class="main-header">📊 Global Stock Dashboard - 1000+ Stocks</h1>', unsafe_allow_html=True)  dashboard = GlobalStockDashboard()  # Sidebar for navigation with st.sidebar: st.header("🌍 Navigation")  view_option = st.radio( "Select View:", ["🔍 Single Stock Analysis", "📊 Bulk Stock Viewer", "🇮🇳 Indian Stocks", "⚡ Quick Search Queue"] )  st.header("⏰ Time Settings") period = st.selectbox("Period:", ["1d", "5d", "1mo", "3mo", "6mo", "1y"], index=2) interval = st.selectbox("Interval:", ["1m", "5m", "15m", "30m", "1h", "1d"], index=5)  # Single Stock Analysis if view_option == "🔍 Single Stock Analysis": col1, col2 = st.columns([2, 1])  with col1: search_symbol = st.text_input("Enter symbol (e.g., RELIANCE.NS, AAPL, BTC-USD):", "RELIANCE.NS").upper()  with col2: st.write("") st.write("") if st.button("Analyze Stock", type="primary"): st.session_state.current_symbol = search_symbol  if 'current_symbol' in st.session_state: data = dashboard.fetch_stock_data(st.session_state.current_symbol, period, interval) if data: # Display metrics cols = st.columns(4) metrics = [ ("Current Price", f"${data['current_price']:.2f}"), ("Change", f"{data['change']:.2f} ({data['change_percent']:.2f}%)"), ("High", f"${data['high']:.2f}"), ("Volume", f"{data['volume']:,}") ]  for i, (label, value) in enumerate(metrics): with cols[i]: st.metric(label, value)  # Chart fig = dashboard.create_candlestick_chart(data['history'], st.session_state.current_symbol) st.plotly_chart(fig, use_container_width=True)  # Info st.write(f"**Company:** {data['name']}") st.write(f"**Currency:** {data['currency']}")  # Bulk Stock Viewer elif view_option == "📊 Bulk Stock Viewer": st.header("📊 Bulk Stock Viewer - Top 50 Stocks")  # Select category category = st.selectbox("Select Category:", ["US Stocks", "Indian Stocks", "Cryptocurrencies", "Forex", "Indices"])  if category == "US Stocks": symbols = dashboard.us_stocks[:20] elif category == "Indian Stocks": symbols = list(dashboard.indian_stocks.keys())[:20] elif category == "Cryptocurrencies": symbols = dashboard.crypto elif category == "Forex": symbols = dashboard.forex else: symbols = dashboard.indices  # Fetch bulk data if st.button("Load Bulk Data", type="primary"): with st.spinner("Loading stock data..."): bulk_data = dashboard.fetch_bulk_data(symbols)  # Create DataFrame for display data_list = [] for symbol, data in bulk_data.items(): data_list.append({ 'Symbol': symbol, 'Name': data['name'], 'Price': data['current_price'], 'Change': data['change'], 'Change %': data['change_percent'], 'Volume': data['volume'], 'High': data['high'], 'Low': data['low'] })  df = pd.DataFrame(data_list) df['Change Color'] = df['Change'].apply(lambda x: 'green' if x >= 0 else 'red')  # Display table st.dataframe( df.style.apply(lambda x: ['color: green' if x['Change'] >= 0 else 'color: red' for _ in x], axis=1), use_container_width=True, height=600 )  # Indian Stocks Section elif view_option == "🇮🇳 Indian Stocks": st.header("🇮🇳 Indian Stock Market")  # Display Indian stocks in a nice layout cols = st.columns(4) indian_symbols = list(dashboard.indian_stocks.keys())  for i, symbol in enumerate(indian_symbols[:20]): data = dashboard.fetch_stock_data(symbol, "1d", "1d") if data: with cols[i % 4]: st.markdown(f""" <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 10px; color: white; margin: 5px;'> <div style='font-size: 1rem; font-weight: bold;'>{symbol}</div> <div style='font-size: 1.2rem;'>₹{data['current_price']:.2f}</div> <div style='color: {'#2ecc71' if data['change'] >= 0 else '#e74c3c'};'> {data['change']:+.2f} ({data['change_percent']:+.2f}%) </div> </div> , unsafe_allow_html=True)
- **main** (Line 221)
  - , unsafe_allow_html=True)  # Quick Search Queue elif view_option == "⚡ Quick Search Queue": st.header("⚡ Quick Search Queue")  # Initialize session state for search queue if 'search_queue' not in st.session_state: st.session_state.search_queue = []  # Add to queue col1, col2 = st.columns([3, 1]) with col1: new_symbol = st.text_input("Add symbol to queue:").upper() with col2: st.write("") if st.button("Add to Queue") and new_symbol: if new_symbol not in st.session_state.search_queue: st.session_state.search_queue.append(new_symbol)  # Display queue if st.session_state.search_queue: st.write("**Current Queue:**") for i, symbol in enumerate(st.session_state.search_queue): col1, col2, col3 = st.columns([3, 1, 1]) with col1: st.write(f"{i+1}. {symbol}") with col2: if st.button("Analyze", key=f"analyze_{i}"): st.session_state.current_symbol = symbol with col3: if st.button("Remove", key=f"remove_{i}"): st.session_state.search_queue.pop(i) st.rerun()  # Analyze all button if st.button("Analyze All in Queue", type="primary"): results = [] for symbol in st.session_state.search_queue: data = dashboard.fetch_stock_data(symbol, "1d", "1d") if data: results.append({ 'Symbol': symbol, 'Price': data['current_price'], 'Change': data['change'], 'Change %': data['change_percent'], 'Volume': data['volume'] })  if results: df = pd.DataFrame(results) st.dataframe( df.style.apply(lambda x: ['color: green' if x['Change'] >= 0 else 'color: red' for _ in x], axis=1), use_container_width=True )  # Last updated st.markdown(f'<p style="text-align: right; color: #666; font-size: 0.9rem;">Last updated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>', unsafe_allow_html=True)  # Refresh button if st.button("🔄 Refresh All Data"): st.rerun()  if __name__ == "__main__": main()

---

### `config.py`
**Lines:** 34

#### Classes:
- **Settings** (Line 4)
  - No documentation
- **Config** (Line 31)
  - No documentation

---

### `generate_docs.py`
**Lines:** 65

#### Functions:
- **extract_fastapi_routes** (Line 8)
  - Extract FastAPI routes and their documentation routes = []  with open(app_file, 'r', encoding='utf-8') as file: tree = ast.parse(file.read())  for node in ast.walk(tree): if isinstance(node, ast.FunctionDef): # Look for route decorators for decorator in node.decorator_list: if (isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute) and decorator.func.attr in ['get', 'post', 'put', 'delete', 'patch']):  route_info = { 'name': node.name, 'method': decorator.func.attr.upper(), 'docstring': ast.get_docstring(node) or 'No documentation', 'line_number': node.lineno } routes.append(route_info)  return routes  def generate_api_documentation(project_path: str) -> str: Generate comprehensive API documentation
- **generate_api_documentation** (Line 33)
  - Generate comprehensive API documentation  docs = [] docs.append("# VR1983 Trading Automation API Documentation\n") docs.append("## API Endpoints\n")  # Find all Python files for py_file in Path(project_path).rglob("*.py"): if any(part.startswith('.') or part == '__pycache__' for part in py_file.parts): continue  routes = extract_fastapi_routes(str(py_file)) if routes: docs.append(f"### {py_file}\n")  for route in routes: docs.append(f"#### `{route['method']}` {route['name']}") docs.append(f"**File:** `{py_file}` (Line {route['line_number']})") docs.append(f"**Description:** {route['docstring']}") docs.append("---\n")  return "\n".join(docs)  # Generate documentation if __name__ == "__main__": project_path = "." documentation = generate_api_documentation(project_path)  with open("API_DOCUMENTATION.md", "w", encoding="utf-8") as f: f.write(documentation)  print("✅ Documentation generated: API_DOCUMENTATION.md")

---

### `test_token.py`
**Lines:** 46

#### Functions:
- **test_security_flow** (Line 8)
  - No documentation

---

### `algo.py`
**Lines:** 160

#### Functions:
- **fetch_historical_data** (Line 11)
  - Fetches historical data using yfinance
- **calculate_rsi** (Line 25)
  - Calculate RSI using pure pandas
- **calculate_sma** (Line 41)
  - Calculate Simple Moving Average using pandas
- **calculate_indicators** (Line 52)
  - Calculates RSI and SMA using pure pandas try: df['rsi'] = calculate_rsi(df['Close'], 14) df['sma_20'] = calculate_sma(df['Close'], 20) print("Indicators calculated successfully") return df except Exception as e: print(f"Error calculating indicators: {e}") return df  # 6. Check if market is open def is_market_open(): Check if Indian stock market is currently open
- **is_market_open** (Line 64)
  - Check if Indian stock market is currently open try: ist = pytz.timezone('Asia/Kolkata') now_ist = datetime.now(ist)  # Market hours: 9:15 AM to 3:30 PM IST, Monday to Friday market_open = time_only(9, 15) market_close = time_only(15, 30)  if now_ist.weekday() > 4:  # Saturday or Sunday print("Market closed: Weekend") return False  current_time = now_ist.time() is_open = market_open <= current_time <= market_close if not is_open: print("Market closed: Outside trading hours") return is_open except Exception as e: print(f"Error checking market hours: {e}") return False  # 7. Main Algorithm Function def check_for_signals(): print("\n" + "="*50) print(f"Checking signals at {datetime.now()}") print("="*50)  if not is_market_open(): return "HOLD"  try: # Fetch Data - using 15min intervals for better data df = fetch_historical_data(TATA_MOTORS_TICKER, interval='15m', period='7d')  if len(df) < 25: print(f"Not enough data: only {len(df)} records available") return "HOLD"  df = calculate_indicators(df)  # Get the latest completed candle latest_candle = df.iloc[-1] previous_candle = df.iloc[-2]  print(f"Latest Candle - Time: {latest_candle.name}") print(f"Price: ₹{latest_candle['Close']:.2f}") print(f"RSI: {latest_candle.get('rsi', 'N/A'):.2f}") print(f"SMA20: ₹{latest_candle.get('sma_20', 'N/A'):.2f}")  # Check if indicators were calculated properly if pd.isna(latest_candle.get('rsi')) or pd.isna(latest_candle.get('sma_20')): print("Indicators not calculated properly. Need more data.") return "HOLD"  # Check for BUY Signal if (previous_candle['rsi'] < 30 and latest_candle['rsi'] > 30 and latest_candle['Close'] > latest_candle['sma_20']): print("🎯 ✅ BUY SIGNAL GENERATED! 🎯") print("Reason: RSI crossed above 30 and price above SMA20") return "BUY"  # Check for SELL Signal elif (previous_candle['rsi'] > 70 and latest_candle['rsi'] < 70 and latest_candle['Close'] < latest_candle['sma_20']): print("🎯 ✅ SELL SIGNAL GENERATED! 🎯") print("Reason: RSI crossed below 70 and price below SMA20") return "SELL"  else: print("➡️ No clear trading signal. Holding position.") return "HOLD"  except Exception as e: print(f"❌ Error in signal generation: {e}") return "HOLD"  # 8. Test the algorithm if __name__ == "__main__": print("Starting Tata Motors Intraday Trading Algorithm") print("Strategy: RSI Mean Reversion with SMA Filter") print("Using pure pandas implementation - no external TA libraries needed") print("="*60)  # Test the function once signal = check_for_signals() print(f"\nFinal Decision: {signal}")  # Uncomment below for continuous running (live trading)
- **check_for_signals** (Line 88)
  - print("\nStarting continuous monitoring...") while True: signal = check_for_signals() # Sleep for 15 minutes (900 seconds) time.sleep(900)

---

### `generate_all_docs.py`
**Lines:** 20

#### Functions:
- **main** (Line 4)
  - No documentation

---

### `exceptions.py`
**Lines:** 24

#### Classes:
- **TradingError** (Line 2)
  - Base exception for all trading-related errors pass  class BrokerConnectionError(TradingError): Raised when unable to connect to broker API
- **BrokerConnectionError** (Line 6)
  - Raised when unable to connect to broker API pass  class OrderExecutionError(TradingError): Raised when order execution fails
- **OrderExecutionError** (Line 10)
  - Raised when order execution fails pass  class InvalidSignalError(TradingError): Raised when a trading signal is invalid
- **InvalidSignalError** (Line 14)
  - Raised when a trading signal is invalid pass  class DatabaseConnectionError(TradingError): Raised when database connection fails
- **DatabaseConnectionError** (Line 18)
  - Raised when database connection fails pass  class InsufficientFundsError(TradingError): Raised when account has insufficient funds for a trade
- **InsufficientFundsError** (Line 22)
  - Raised when account has insufficient funds for a trade pass

---

### `auto_documenter.py`
**Lines:** 182

#### Classes:
- **FastAPIAutoDocumenter** (Line 8)
  - Automatically generate documentation for FastAPI projects  def __init__(self, project_root: str = "."): self.project_root = Path(project_root) self.documentation = { "project": {}, "modules": [], "endpoints": [], "models": [], "services": [] }  def analyze_project_structure(self): Analyze the complete project structure

#### Functions:
- **__init__** (Line 11)
  - Analyze the complete project structure self.documentation["project"] = { "name": "VR1983 Trading Automation", "description": "Algorithmic trading platform with user-specific watchlists", "structure": self._get_directory_structure() }  def _get_directory_structure(self) -> Dict[str, Any]: Get the complete directory structure
- **analyze_project_structure** (Line 21)
  - Analyze the complete project structure self.documentation["project"] = { "name": "VR1983 Trading Automation", "description": "Algorithmic trading platform with user-specific watchlists", "structure": self._get_directory_structure() }  def _get_directory_structure(self) -> Dict[str, Any]: Get the complete directory structure
- **_get_directory_structure** (Line 29)
  - Get the complete directory structure structure = {}  for item in self.project_root.rglob("*"): if any(part.startswith('.') for part in item.parts) or item.name == '__pycache__': continue  relative_path = item.relative_to(self.project_root) if item.is_file(): structure[str(relative_path)] = "file" else: structure[str(relative_path)] = "directory"  return structure  def extract_module_documentation(self): Extract documentation from all Python modules
- **extract_module_documentation** (Line 45)
  - Extract documentation from all Python modules for py_file in self.project_root.rglob("*.py"): if any(part.startswith('.') or part == '__pycache__' for part in py_file.parts): continue  module_docs = self._analyze_python_file(py_file) if module_docs: self.documentation["modules"].append(module_docs)  def _analyze_python_file(self, file_path: Path) -> Dict[str, Any]: Analyze a single Python file
- **_analyze_python_file** (Line 55)
  - Analyze a single Python file try: with open(file_path, 'r', encoding='utf-8') as f: content = f.read()  # Simple analysis - you can extend this with ast module lines = content.split('\n') functions = [] classes = [] imports = []  for i, line in enumerate(lines): line = line.strip()  if line.startswith('def '): func_name = line.split('def ')[1].split('(')[0] functions.append({ 'name': func_name, 'line': i + 1, 'docstring': self._extract_docstring(lines, i) })  elif line.startswith('class '): class_name = line.split('class ')[1].split('(')[0].split(':')[0] classes.append({ 'name': class_name, 'line': i + 1, 'docstring': self._extract_docstring(lines, i) })  elif line.startswith(('import ', 'from ')): imports.append(line)  return { 'file_path': str(file_path.relative_to(self.project_root)), 'functions': functions, 'classes': classes, 'imports': imports, 'line_count': len(lines) }  except Exception as e: print(f"Error analyzing {file_path}: {e}") return None  def _extract_docstring(self, lines: List[str], start_line: int) -> str: Extract docstring from function or class
- **_extract_docstring** (Line 101)
  - Extract docstring from function or class docstring = "" in_docstring = False  for i in range(start_line + 1, len(lines)): line = lines[i].strip()  if line.startswith('"""') or line.startswith("'''"): if not in_docstring: in_docstring = True docstring = line.replace('"""', '').replace("'''", '') else: docstring += ' ' + line.replace('"""', '').replace("'''", '') break elif in_docstring: docstring += ' ' + line  return docstring.strip() if docstring else "No documentation"  def generate_markdown_docs(self, output_file: str = "PROJECT_DOCUMENTATION.md"): Generate comprehensive markdown documentation
- **generate_markdown_docs** (Line 121)
  - Generate comprehensive markdown documentation  docs = [] docs.append("# VR1983 Trading Automation - Project Documentation\n")  # Project Overview docs.append("## Project Overview") docs.append("**Name:** VR1983 Trading Automation") docs.append("**Description:** Algorithmic trading platform with real-time signals and user watchlists") docs.append("**Architecture:** FastAPI + MongoDB + Background Scheduler") docs.append("\n---\n")  # Project Structure docs.append("## Project Structure") for path, type_ in self.documentation["project"]["structure"].items(): icon = "📁" if type_ == "directory" else "📄" docs.append(f"{icon} `{path}`")  docs.append("\n---\n")  # Modules Documentation docs.append("## Modules & Components\n")  for module in self.documentation["modules"]: docs.append(f"### `{module['file_path']}`") docs.append(f"**Lines:** {module['line_count']}")  if module['classes']: docs.append("\n#### Classes:") for cls in module['classes']: docs.append(f"- **{cls['name']}** (Line {cls['line']})") docs.append(f"  - {cls['docstring']}")  if module['functions']: docs.append("\n#### Functions:") for func in module['functions']: docs.append(f"- **{func['name']}** (Line {func['line']})") docs.append(f"  - {func['docstring']}")  docs.append("\n---\n")  # Write to file with open(output_file, 'w', encoding='utf-8') as f: f.write('\n'.join(docs))  print(f"✅ Comprehensive documentation generated: {output_file}")  def generate_json_docs(self, output_file: str = "project_docs.json"): Generate JSON documentation for programmatic use
- **generate_json_docs** (Line 169)
  - Generate JSON documentation for programmatic use with open(output_file, 'w', encoding='utf-8') as f: json.dump(self.documentation, f, indent=2, ensure_ascii=False)  print(f"✅ JSON documentation generated: {output_file}")  # Usage if __name__ == "__main__": documenter = FastAPIAutoDocumenter(".") documenter.analyze_project_structure() documenter.extract_module_documentation() documenter.generate_markdown_docs() documenter.generate_json_docs()

---

### `api/order.py`
**Lines:** 446

#### Classes:
- **OrderViewItem** (Line 250)
  - A simple function to determine risk level based on P&L. You can make this much more sophisticated later (using ATR, volatility, etc.).
- **OrderViewPanelItem** (Line 340)
  - Returns the user's executed orders with full details for the Order View Panel.
- **HoldingViewItem** (Line 395)
  - Returns the user's holdings with P&L, risk level, and pre-calculated values.

#### Functions:
- **get_current_market_price** (Line 29)
  - Get current market price from yfinance with proper error handling try: # Add .NS for NSE symbols if not already present if not symbol.endswith('.NS'): symbol += '.NS'  ticker = yf.Ticker(symbol)  # Try to get regular market price first info = ticker.info current_price = info.get('regularMarketPrice')  # If not available, try currentPrice if current_price is None: current_price = info.get('currentPrice')  # If still not available, get latest historical data if current_price is None or current_price == 0: hist = ticker.history(period="1d", interval="1m") if not hist.empty: current_price = hist['Close'].iloc[-1]  # If all else fails, raise an exception if current_price is None or current_price == 0: raise ValueError(f"Could not fetch price for {symbol}")  return round(current_price, 2)  except Exception as e: logger.error(f"Error fetching price for {symbol}: {str(e)}") raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not fetch current market price for {symbol}. Please try again." )  @router.post("/order", response_model=OrderResponse) async def place_order( order: OrderRequest, current_user: UserInDB = Depends(get_current_user) ): Place an order (paper trading)
- **calculate_risk_level** (Line 261)
  - A simple function to determine risk level based on P&L. You can make this much more sophisticated later (using ATR, volatility, etc.).

---

### `api/strategy_management.py`
**Lines:** 154

---

### `api/watchlist.py`
**Lines:** 179

---

### `api/csv_file.py`
**Lines:** 42

---

### `api/strategy_marketplace.py`
**Lines:** 78

---

### `api/market.py`
**Lines:** 241

#### Classes:
- **StockDashboard** (Line 16)
  - Load Indian stock symbols with their names return { 'RELIANCE.NS': 'Reliance Industries', 'TATAMOTORS.NS': 'Tata Motors', 'INFY.NS': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'TCS.NS': 'Tata Consultancy Services', 'ICICIBANK.NS': 'ICICI Bank', 'HINDUNILVR.NS': 'Hindustan Unilever', 'SBIN.NS': 'State Bank of India', 'BAJFINANCE.NS': 'Bajaj Finance', 'KOTAKBANK.NS': 'Kotak Mahindra Bank', 'ITC.NS': 'ITC Limited', 'LT.NS': 'Larsen & Toubro', 'AXISBANK.NS': 'Axis Bank', 'BHARTIARTL.NS': 'Bharti Airtel', 'MARUTI.NS': 'Maruti Suzuki', 'ASIANPAINT.NS': 'Asian Paints', 'HINDALCO.NS': 'Hindalco Industries', 'SUNPHARMA.NS': 'Sun Pharmaceutical', 'TITAN.NS': 'Titan Company', 'POWERGRID.NS': 'Power Grid Corporation', 'NTPC.NS': 'NTPC Limited', 'ONGC.NS': 'Oil & Natural Gas Corporation', 'WIPRO.NS': 'Wipro', 'ADANIPORTS.NS': 'Adani Ports', 'ULTRACEMCO.NS': 'UltraTech Cement', 'JSWSTEEL.NS': 'JSW Steel', 'TECHM.NS': 'Tech Mahindra', 'GRASIM.NS': 'Grasim Industries', 'HCLTECH.NS': 'HCL Technologies', 'DRREDDY.NS': 'Dr. Reddy\'s Laboratories', 'INDUSINDBK.NS': 'IndusInd Bank', 'CIPLA.NS': 'Cipla', 'BAJAJFINSV.NS': 'Bajaj Finserv', 'TATASTEEL.NS': 'Tata Steel', 'HEROMOTOCO.NS': 'Hero MotoCorp', 'COALINDIA.NS': 'Coal India', 'BPCL.NS': 'Bharat Petroleum', 'EICHERMOT.NS': 'Eicher Motors', 'DIVISLAB.NS': 'Divi\'s Laboratories', 'BRITANNIA.NS': 'Britannia Industries', 'SBILIFE.NS': 'SBI Life Insurance', 'HDFCLIFE.NS': 'HDFC Life Insurance', 'UPL.NS': 'UPL Limited', 'VEDL.NS': 'Vedanta Limited', 'SHREECEM.NS': 'Shree Cement', 'HINDPETRO.NS': 'Hindustan Petroleum', 'IOC.NS': 'Indian Oil Corporation', 'GAIL.NS': 'GAIL India', 'M&M.NS': 'Mahindra & Mahindra' } def fetch_stock_data(self, symbol: str, period: str = "1d", interval: str = "1d"): try: stock = yf.Ticker(symbol) hist = stock.history(period=period, interval=interval)  if hist.empty: return None  info = stock.info prev_close = info.get( 'previousClose', hist['Close'].iloc[-2] if len(hist) > 1 else hist['Close'].iloc[-1] )  current_price = hist['Close'].iloc[-1] change = current_price - prev_close change_percent = (change / prev_close) * 100  stock_name = self.indian_stocks.get(symbol, info.get('longName', symbol))  # ✅ Fix timezone-aware timestamps hist = hist.reset_index() if "Datetime" in hist.columns:  # intraday intervals hist.rename(columns={"Datetime": "date"}, inplace=True) elif "Date" in hist.columns:    # daily/longer intervals hist.rename(columns={"Date": "date"}, inplace=True)  hist["date"] = pd.to_datetime(hist["date"]).dt.strftime("%Y-%m-%d %H:%M:%S")  hist_dict = hist.to_dict("records")  return { 'history': hist_dict, 'current_price': float(current_price), 'prev_close': float(prev_close), 'change': float(change), 'change_percent': float(change_percent), 'high': float(hist['High'].max()), 'low': float(hist['Low'].min()), 'volume': int(hist['Volume'].sum()), 'symbol': symbol, 'name': stock_name, 'currency': info.get('currency', 'USD'), 'last_updated': datetime.now().isoformat() } except Exception as e: logger.error(f"Error fetching data for {symbol}: {str(e)}") return None   def fetch_bulk_data(self, symbols: List[str]): Fetch data for multiple symbols

#### Functions:
- **__init__** (Line 17)
  - Load Indian stock symbols with their names return { 'RELIANCE.NS': 'Reliance Industries', 'TATAMOTORS.NS': 'Tata Motors', 'INFY.NS': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'TCS.NS': 'Tata Consultancy Services', 'ICICIBANK.NS': 'ICICI Bank', 'HINDUNILVR.NS': 'Hindustan Unilever', 'SBIN.NS': 'State Bank of India', 'BAJFINANCE.NS': 'Bajaj Finance', 'KOTAKBANK.NS': 'Kotak Mahindra Bank', 'ITC.NS': 'ITC Limited', 'LT.NS': 'Larsen & Toubro', 'AXISBANK.NS': 'Axis Bank', 'BHARTIARTL.NS': 'Bharti Airtel', 'MARUTI.NS': 'Maruti Suzuki', 'ASIANPAINT.NS': 'Asian Paints', 'HINDALCO.NS': 'Hindalco Industries', 'SUNPHARMA.NS': 'Sun Pharmaceutical', 'TITAN.NS': 'Titan Company', 'POWERGRID.NS': 'Power Grid Corporation', 'NTPC.NS': 'NTPC Limited', 'ONGC.NS': 'Oil & Natural Gas Corporation', 'WIPRO.NS': 'Wipro', 'ADANIPORTS.NS': 'Adani Ports', 'ULTRACEMCO.NS': 'UltraTech Cement', 'JSWSTEEL.NS': 'JSW Steel', 'TECHM.NS': 'Tech Mahindra', 'GRASIM.NS': 'Grasim Industries', 'HCLTECH.NS': 'HCL Technologies', 'DRREDDY.NS': 'Dr. Reddy\'s Laboratories', 'INDUSINDBK.NS': 'IndusInd Bank', 'CIPLA.NS': 'Cipla', 'BAJAJFINSV.NS': 'Bajaj Finserv', 'TATASTEEL.NS': 'Tata Steel', 'HEROMOTOCO.NS': 'Hero MotoCorp', 'COALINDIA.NS': 'Coal India', 'BPCL.NS': 'Bharat Petroleum', 'EICHERMOT.NS': 'Eicher Motors', 'DIVISLAB.NS': 'Divi\'s Laboratories', 'BRITANNIA.NS': 'Britannia Industries', 'SBILIFE.NS': 'SBI Life Insurance', 'HDFCLIFE.NS': 'HDFC Life Insurance', 'UPL.NS': 'UPL Limited', 'VEDL.NS': 'Vedanta Limited', 'SHREECEM.NS': 'Shree Cement', 'HINDPETRO.NS': 'Hindustan Petroleum', 'IOC.NS': 'Indian Oil Corporation', 'GAIL.NS': 'GAIL India', 'M&M.NS': 'Mahindra & Mahindra' } def fetch_stock_data(self, symbol: str, period: str = "1d", interval: str = "1d"): try: stock = yf.Ticker(symbol) hist = stock.history(period=period, interval=interval)  if hist.empty: return None  info = stock.info prev_close = info.get( 'previousClose', hist['Close'].iloc[-2] if len(hist) > 1 else hist['Close'].iloc[-1] )  current_price = hist['Close'].iloc[-1] change = current_price - prev_close change_percent = (change / prev_close) * 100  stock_name = self.indian_stocks.get(symbol, info.get('longName', symbol))  # ✅ Fix timezone-aware timestamps hist = hist.reset_index() if "Datetime" in hist.columns:  # intraday intervals hist.rename(columns={"Datetime": "date"}, inplace=True) elif "Date" in hist.columns:    # daily/longer intervals hist.rename(columns={"Date": "date"}, inplace=True)  hist["date"] = pd.to_datetime(hist["date"]).dt.strftime("%Y-%m-%d %H:%M:%S")  hist_dict = hist.to_dict("records")  return { 'history': hist_dict, 'current_price': float(current_price), 'prev_close': float(prev_close), 'change': float(change), 'change_percent': float(change_percent), 'high': float(hist['High'].max()), 'low': float(hist['Low'].min()), 'volume': int(hist['Volume'].sum()), 'symbol': symbol, 'name': stock_name, 'currency': info.get('currency', 'USD'), 'last_updated': datetime.now().isoformat() } except Exception as e: logger.error(f"Error fetching data for {symbol}: {str(e)}") return None   def fetch_bulk_data(self, symbols: List[str]): Fetch data for multiple symbols
- **load_indian_stocks** (Line 28)
  - Load Indian stock symbols with their names return { 'RELIANCE.NS': 'Reliance Industries', 'TATAMOTORS.NS': 'Tata Motors', 'INFY.NS': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'TCS.NS': 'Tata Consultancy Services', 'ICICIBANK.NS': 'ICICI Bank', 'HINDUNILVR.NS': 'Hindustan Unilever', 'SBIN.NS': 'State Bank of India', 'BAJFINANCE.NS': 'Bajaj Finance', 'KOTAKBANK.NS': 'Kotak Mahindra Bank', 'ITC.NS': 'ITC Limited', 'LT.NS': 'Larsen & Toubro', 'AXISBANK.NS': 'Axis Bank', 'BHARTIARTL.NS': 'Bharti Airtel', 'MARUTI.NS': 'Maruti Suzuki', 'ASIANPAINT.NS': 'Asian Paints', 'HINDALCO.NS': 'Hindalco Industries', 'SUNPHARMA.NS': 'Sun Pharmaceutical', 'TITAN.NS': 'Titan Company', 'POWERGRID.NS': 'Power Grid Corporation', 'NTPC.NS': 'NTPC Limited', 'ONGC.NS': 'Oil & Natural Gas Corporation', 'WIPRO.NS': 'Wipro', 'ADANIPORTS.NS': 'Adani Ports', 'ULTRACEMCO.NS': 'UltraTech Cement', 'JSWSTEEL.NS': 'JSW Steel', 'TECHM.NS': 'Tech Mahindra', 'GRASIM.NS': 'Grasim Industries', 'HCLTECH.NS': 'HCL Technologies', 'DRREDDY.NS': 'Dr. Reddy\'s Laboratories', 'INDUSINDBK.NS': 'IndusInd Bank', 'CIPLA.NS': 'Cipla', 'BAJAJFINSV.NS': 'Bajaj Finserv', 'TATASTEEL.NS': 'Tata Steel', 'HEROMOTOCO.NS': 'Hero MotoCorp', 'COALINDIA.NS': 'Coal India', 'BPCL.NS': 'Bharat Petroleum', 'EICHERMOT.NS': 'Eicher Motors', 'DIVISLAB.NS': 'Divi\'s Laboratories', 'BRITANNIA.NS': 'Britannia Industries', 'SBILIFE.NS': 'SBI Life Insurance', 'HDFCLIFE.NS': 'HDFC Life Insurance', 'UPL.NS': 'UPL Limited', 'VEDL.NS': 'Vedanta Limited', 'SHREECEM.NS': 'Shree Cement', 'HINDPETRO.NS': 'Hindustan Petroleum', 'IOC.NS': 'Indian Oil Corporation', 'GAIL.NS': 'GAIL India', 'M&M.NS': 'Mahindra & Mahindra' } def fetch_stock_data(self, symbol: str, period: str = "1d", interval: str = "1d"): try: stock = yf.Ticker(symbol) hist = stock.history(period=period, interval=interval)  if hist.empty: return None  info = stock.info prev_close = info.get( 'previousClose', hist['Close'].iloc[-2] if len(hist) > 1 else hist['Close'].iloc[-1] )  current_price = hist['Close'].iloc[-1] change = current_price - prev_close change_percent = (change / prev_close) * 100  stock_name = self.indian_stocks.get(symbol, info.get('longName', symbol))  # ✅ Fix timezone-aware timestamps hist = hist.reset_index() if "Datetime" in hist.columns:  # intraday intervals hist.rename(columns={"Datetime": "date"}, inplace=True) elif "Date" in hist.columns:    # daily/longer intervals hist.rename(columns={"Date": "date"}, inplace=True)  hist["date"] = pd.to_datetime(hist["date"]).dt.strftime("%Y-%m-%d %H:%M:%S")  hist_dict = hist.to_dict("records")  return { 'history': hist_dict, 'current_price': float(current_price), 'prev_close': float(prev_close), 'change': float(change), 'change_percent': float(change_percent), 'high': float(hist['High'].max()), 'low': float(hist['Low'].min()), 'volume': int(hist['Volume'].sum()), 'symbol': symbol, 'name': stock_name, 'currency': info.get('currency', 'USD'), 'last_updated': datetime.now().isoformat() } except Exception as e: logger.error(f"Error fetching data for {symbol}: {str(e)}") return None   def fetch_bulk_data(self, symbols: List[str]): Fetch data for multiple symbols
- **fetch_stock_data** (Line 81)
  - Fetch data for multiple symbols results = {} for symbol in symbols: data = self.fetch_stock_data(symbol, period="1d", interval="1d") if data: results[symbol] = data return results  def get_categories(self): Get all available categories
- **fetch_bulk_data** (Line 131)
  - Fetch data for multiple symbols results = {} for symbol in symbols: data = self.fetch_stock_data(symbol, period="1d", interval="1d") if data: results[symbol] = data return results  def get_categories(self): Get all available categories
- **get_categories** (Line 140)
  - Get all available categories return { "US Stocks": self.us_stocks[:20], "Indian Stocks": list(self.indian_stocks.keys())[:20], "Cryptocurrencies": self.crypto, "Forex": self.forex, "Indices": self.indices }  # Initialize dashboard dashboard = StockDashboard()  @router.get("/stock/{symbol}") async def get_stock_data( symbol: str, period: str = "1d", interval: str = "1d" ): Get data for a single stock

---

### `api/signal.py`
**Lines:** 107

---

### `api/levels.py`
**Lines:** 49

---

### `api/broker.py`
**Lines:** 220

#### Functions:
- **encrypt_data** (Line 25)
  - Add a broker connection for the user  # Check if broker already exists existing = await brokers_collection.find_one({ "user_id": str(current_user.id), "broker_name": broker.broker_name, "status": "active" })  if existing: raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail=f"{broker.broker_name} broker already connected" )  # Simple broker data without encryption for now broker_data = { "user_id": str(current_user.id), "broker_name": broker.broker_name, "display_name": broker.broker_name,  # ✅ Use broker_name as display_name "api_key": broker.api_key,  # ✅ Remove encryption for testing "api_secret": broker.api_secret,  # ✅ Remove encryption for testing "is_active": True,  # ✅ Add required field "status": "active", "created_at": datetime.utcnow(), "last_used": datetime.utcnow(), "connection_type": "api_key" }  result = await brokers_collection.insert_one(broker_data) broker_data["id"] = str(result.inserted_id)  # Update user's brokers list await users_collection.update_one( {"_id": ObjectId(current_user.id)}, {"$addToSet": {"connected_brokers": broker.broker_name}} )  # ✅ Return only the fields that BrokerResponse expects return BrokerResponse( id=broker_data["id"], broker_name=broker_data["broker_name"], display_name=broker_data["display_name"], is_active=broker_data["is_active"], created_at=broker_data["created_at"], last_used=broker_data["last_used"] )  @router.get("/list", response_model=List[BrokerResponse]) async def list_brokers(current_user: UserInDB = Depends(get_current_user)): Get all brokers for current user
- **decrypt_data** (Line 29)
  - Add a broker connection for the user  # Check if broker already exists existing = await brokers_collection.find_one({ "user_id": str(current_user.id), "broker_name": broker.broker_name, "status": "active" })  if existing: raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail=f"{broker.broker_name} broker already connected" )  # Simple broker data without encryption for now broker_data = { "user_id": str(current_user.id), "broker_name": broker.broker_name, "display_name": broker.broker_name,  # ✅ Use broker_name as display_name "api_key": broker.api_key,  # ✅ Remove encryption for testing "api_secret": broker.api_secret,  # ✅ Remove encryption for testing "is_active": True,  # ✅ Add required field "status": "active", "created_at": datetime.utcnow(), "last_used": datetime.utcnow(), "connection_type": "api_key" }  result = await brokers_collection.insert_one(broker_data) broker_data["id"] = str(result.inserted_id)  # Update user's brokers list await users_collection.update_one( {"_id": ObjectId(current_user.id)}, {"$addToSet": {"connected_brokers": broker.broker_name}} )  # ✅ Return only the fields that BrokerResponse expects return BrokerResponse( id=broker_data["id"], broker_name=broker_data["broker_name"], display_name=broker_data["display_name"], is_active=broker_data["is_active"], created_at=broker_data["created_at"], last_used=broker_data["last_used"] )  @router.get("/list", response_model=List[BrokerResponse]) async def list_brokers(current_user: UserInDB = Depends(get_current_user)): Get all brokers for current user

---

### `api/user.py`
**Lines:** 432

---

### `api/strategy_backtest.py`
**Lines:** 127

---

### `api/upstox.py`
**Lines:** 190

#### Functions:
- **login** (Line 23)
  - Store Upstox connection in brokers collection  upstox_user_id = profile.get('user_id', 'unknown') user_name = profile.get('user_name', 'Unknown User') email = profile.get('email', '')  # Prepare broker connection document broker_connection = { "broker_name": "upstox", "broker_user_id": upstox_user_id, "user_name": user_name, "email": email, "access_token": token_data['access_token'], "refresh_token": token_data.get('refresh_token', ''), "token_expiry": datetime.now() + timedelta(seconds=token_data.get('expires_in', 86400)), "created_at": datetime.now(), "last_used": datetime.now(), "is_active": True, "profile_data": profile  # Store full profile for reference }  # Upsert the broker connection result = await brokers_collection.update_one( { "broker_name": "upstox", "broker_user_id": upstox_user_id }, {"$set": broker_connection}, upsert=True )  # Also update the main users collection if needed await users_collection.update_one( {"email": email},  # or whatever identifier you use { "$set": { "broker_connected": True, "broker_name": "upstox", "broker_user_id": upstox_user_id, "last_broker_connection": datetime.now() }, "$addToSet": { "connected_brokers": "upstox" } }, upsert=False  # Only update if user exists )  return upstox_user_id  def get_user_profile(access_token: str) -> Dict[str, Any]: Fetch user profile from Upstox
- **get_user_profile** (Line 128)
  - Fetch user profile from Upstox headers = {"Authorization": f"Bearer {access_token}"} response = requests.get("https://api.upstox.com/v2/user/profile", headers=headers) return response.json().get('data', {})  # Utility function to get active Upstox connection async def get_upstox_connection(broker_user_id: str = None, email: str = None) -> Dict[str, Any]: Retrieve active Upstox connection from database

---

### `api/password.py`
**Lines:** 70

#### Classes:
- **ForgotPasswordRequest** (Line 17)
  - No documentation
- **ResetPasswordRequest** (Line 21)
  - No documentation

---

### `api/strategy_editor.py`
**Lines:** 84

---

### `api/routes.py`
**Lines:** 40

---

### `test/test_market.py`
**Lines:** 57

#### Functions:
- **test_get_stock_data** (Line 9)
  - No documentation
- **test_get_bulk_data_us_stocks** (Line 17)
  - No documentation
- **test_get_categories** (Line 25)
  - No documentation
- **test_get_indian_stocks** (Line 33)
  - No documentation
- **test_process_search_queue** (Line 41)
  - No documentation
- **test_get_historical_data** (Line 50)
  - No documentation

---

### `database/collections.py`
**Lines:** 155

---

### `database/connection.py`
**Lines:** 17

#### Functions:
- **get_db_connection** (Line 7)
  - No documentation

---

### `schemas/order.py`
**Lines:** 46

#### Classes:
- **OrderRequest** (Line 6)
  - No documentation
- **Config** (Line 17)
  - No documentation
- **OrderResponse** (Line 20)
  - No documentation
- **Trade** (Line 26)
  - No documentation
- **Holding** (Line 40)
  - No documentation

---

### `schemas/market.py`
**Lines:** 31

#### Classes:
- **MarketData** (Line 6)
  - No documentation
- **MarketDataInDB** (Line 12)
  - No documentation
- **Config** (Line 29)
  - No documentation

#### Functions:
- **__get_validators__** (Line 20)
  - No documentation
- **validate_objectid** (Line 24)
  - No documentation

---

### `schemas/signal.py`
**Lines:** 1

---

### `schemas/preference.py`
**Lines:** 37

#### Classes:
- **RiskLevel** (Line 6)
  - No documentation
- **Preference** (Line 11)
  - No documentation
- **PreferenceInDB** (Line 18)
  - No documentation
- **Config** (Line 35)
  - No documentation

#### Functions:
- **__get_validators__** (Line 26)
  - No documentation
- **validate_objectid** (Line 30)
  - No documentation

---

### `schemas/broker.py`
**Lines:** 47

#### Classes:
- **BrokerType** (Line 6)
  - No documentation
- **BrokerStatus** (Line 12)
  - No documentation
- **BrokerBase** (Line 17)
  - No documentation
- **BrokerCreate** (Line 22)
  - No documentation
- **BrokerResponse** (Line 27)
  - No documentation
- **Config** (Line 35)
  - No documentation
- **BrokerConnection** (Line 38)
  - No documentation
- **UpstoxOAuthRequest** (Line 46)
  - No documentation

---

### `schemas/user.py`
**Lines:** 108

#### Classes:
- **Token** (Line 8)
  - No documentation
- **UserUpdate** (Line 12)
  - No documentation
- **WatchlistItem** (Line 19)
  - No documentation
- **Config** (Line 23)
  - No documentation
- **User** (Line 26)
  - No documentation
- **UserInDB** (Line 62)
  - No documentation

#### Functions:
- **validate_role** (Line 43)
  - No documentation
- **validate_password_strength** (Line 51)
  - No documentation
- **convert_watchlist** (Line 84)
  - No documentation
- **validate_mobile** (Line 93)
  - No documentation
- **convert_objectid** (Line 103)
  - No documentation

---

### `schemas/notification.py`
**Lines:** 40

#### Classes:
- **NotificationType** (Line 7)
  - No documentation
- **Notification** (Line 13)
  - No documentation
- **NotificationInDB** (Line 20)
  - No documentation
- **Config** (Line 38)
  - No documentation

#### Functions:
- **__get_validators__** (Line 29)
  - No documentation
- **validate_objectid** (Line 33)
  - No documentation

---

### `schemas/strategy.py`
**Lines:** 69

#### Classes:
- **StrategyLanguage** (Line 7)
  - No documentation
- **StrategyStatus** (Line 12)
  - No documentation
- **BacktestStatus** (Line 17)
  - No documentation
- **StrategyCreate** (Line 24)
  - No documentation
- **StrategyResponse** (Line 34)
  - No documentation
- **Config** (Line 49)
  - No documentation
- **BacktestRequest** (Line 53)
  - No documentation
- **BacktestResponse** (Line 65)
  - No documentation

---

### `scripts/migrate_roles.py`
**Lines:** 13

---

### `middleware/role_middleware.py`
**Lines:** 20

#### Functions:
- **require_roles** (Line 7)
  - No documentation
- **role_checker** (Line 8)
  - No documentation

---

### `services/real_trading_executor.py`
**Lines:** 33

#### Classes:
- **RealTradingExecutor** (Line 7)
  - Execute real trade through your existing order system  # Convert strategy signal to your OrderRequest format order_request = OrderRequest( symbol=strategy_signal['symbol'], transaction_type=strategy_signal['action'].upper(), order_type="MARKET", quantity=strategy_signal['quantity'], product="MIS" )  # Use your existing order placement order_response = await self._place_order(order_request)  # Link strategy with real order strategy_order = { 'user_id': user_id, 'strategy_id': strategy_signal['strategy_id'], 'order_id': order_response.order_id, 'signal_data': strategy_signal, 'executed_at': datetime.utcnow() }  await strategy_orders_collection.insert_one(strategy_order) return order_response

---

### `services/storage.py`
**Lines:** 11

---

### `services/market.py`
**Lines:** 221

#### Classes:
- **StockDataAPI** (Line 16)
  - Check if the period and interval combination is valid if period in self.valid_combinations: return interval in self.valid_combinations[period] return False  def get_valid_intervals(self, period: str) -> List[str]: Get valid intervals for a given period

#### Functions:
- **__init__** (Line 17)
  - Check if the period and interval combination is valid if period in self.valid_combinations: return interval in self.valid_combinations[period] return False  def get_valid_intervals(self, period: str) -> List[str]: Get valid intervals for a given period
- **validate_period_interval** (Line 70)
  - Check if the period and interval combination is valid if period in self.valid_combinations: return interval in self.valid_combinations[period] return False  def get_valid_intervals(self, period: str) -> List[str]: Get valid intervals for a given period
- **get_valid_intervals** (Line 76)
  - Get valid intervals for a given period return self.valid_combinations.get(period, ['1d'])  async def fetch_stock_data(self, symbol: str, period: str = "1d", interval: str = "1d") -> Optional[Dict]: Fetch stock data asynchronously with improved error handling
- **get_all_categories** (Line 186)
  - Get all stock categories return { 'indian_stocks': list(self.indian_stocks.keys()), 'us_stocks': self.us_stocks, 'crypto': self.crypto, 'forex': self.forex, 'indices': self.indices }  def search_stocks(self, query: str) -> List[Dict[str, str]]: Search stocks by symbol or name
- **search_stocks** (Line 196)
  - Search stocks by symbol or name results = [] query = query.lower()  # Search in all categories all_symbols = { **self.indian_stocks, **{symbol: symbol for symbol in self.us_stocks}, **{symbol: symbol for symbol in self.crypto}, **{symbol: symbol for symbol in self.forex}, **{symbol: symbol for symbol in self.indices} }  for symbol, name in all_symbols.items(): if query in symbol.lower() or query in str(name).lower(): results.append({ 'symbol': symbol, 'name': name if name != symbol else f"{symbol} (No name available)" })  return results[:100]  # Limit to 100 results  # Create instance of StockDataAPI  stock_api = StockDataAPI()

---

### `services/scheduler.py`
**Lines:** 259

#### Classes:
- **SchedulerManager** (Line 23)
  - Manager for handling scheduler operations with proper async support  def __init__(self): self.scheduler = None self._running = False  async def start(self): Initialize and start the background scheduler

#### Functions:
- **__init__** (Line 26)
  - Initialize and start the background scheduler if self._running: logger.warning("⚠️ Scheduler is already running") return  try: # Create scheduler instance self.scheduler = BackgroundScheduler()  # Run every 15 minutes for optimal signal frequency self.scheduler.add_job( self._safe_check_watchlists, trigger=IntervalTrigger(minutes=15), id='user_algo_trading_checker', name='User-specific algorithmic trading - 15min intervals', replace_existing=True )  # Start the scheduler self.scheduler.start() self._running = True  logger.info("✅ User-specific scheduler started successfully") logger.info("📊 Will check user watchlists every 15 minutes") logger.info("⏰ First analysis will run in 15 minutes")  except Exception as e: logger.error(f"❌ Failed to start scheduler: {e}") self._running = False raise  def _safe_check_watchlists(self):
- **_safe_check_watchlists** (Line 62)
  - Safely run the watchlist check from synchronous scheduler context
- **is_running** (Line 216)
  - Check if scheduler is running return self._running   # Global scheduler instance scheduler_manager = SchedulerManager()   async def start_scheduler():
- **get_scheduler_status** (Line 239)
  - Get current scheduler status
- **start_scheduler_sync** (Line 250)
  - Synchronous version for backward compatibility

---

### `services/trade.py`
**Lines:** 150

#### Functions:
- **calculate_rsi** (Line 8)
  - Calculate RSI using pure pandas delta = series.diff() gain = (delta.where(delta > 0, 0)).rolling(window=period).mean() loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean() rs = gain / loss rsi = 100 - (100 / (1 + rs)) return rsi  # Pure pandas implementation of SMA def calculate_sma(series, period=20): Calculate Simple Moving Average using pandas
- **calculate_sma** (Line 18)
  - Calculate Simple Moving Average using pandas return series.rolling(window=period).mean()  # Check if market is open def is_market_open(): Check if Indian stock market is currently open
- **is_market_open** (Line 23)
  - Check if Indian stock market is currently open ist = pytz.timezone('Asia/Kolkata') now_ist = datetime.now(ist)  market_open = time_only(9, 15) market_close = time_only(15, 30)  if now_ist.weekday() > 4:  # Saturday or Sunday return False  current_time = now_ist.time() return market_open <= current_time <= market_close  # Generate trading signal async def generate_trading_signal(symbol, period, interval): Generate trading signal for a symbol

---

### `services/strategy_executor.py`
**Lines:** 111

#### Classes:
- **StrategyExecutor** (Line 9)
  - Execute user's strategy code try: # Get historical data data = await self._fetch_historical_data( request.symbol, request.timeframe, request.start_date, request.end_date )  # Execute strategy based on language executor = self.supported_languages[request.language] results = await executor(request.strategy_code, data, request.parameters)  return { "status": "completed", "results": results, "performance_metrics": self._calculate_metrics(results) }  except Exception as e: return { "status": "failed", "error": str(e) }  async def _execute_pine_script(self, code: str, data: pd.DataFrame, params: Dict) -> Dict: Execute Pine Script strategy

#### Functions:
- **__init__** (Line 10)
  - Execute user's strategy code try: # Get historical data data = await self._fetch_historical_data( request.symbol, request.timeframe, request.start_date, request.end_date )  # Execute strategy based on language executor = self.supported_languages[request.language] results = await executor(request.strategy_code, data, request.parameters)  return { "status": "completed", "results": results, "performance_metrics": self._calculate_metrics(results) }  except Exception as e: return { "status": "failed", "error": str(e) }  async def _execute_pine_script(self, code: str, data: pd.DataFrame, params: Dict) -> Dict: Execute Pine Script strategy
- **_get_safe_indicators** (Line 100)
  - Provide safe technical indicators for user strategies return { 'sma': self._sma, 'ema': self._ema, 'rsi': self._rsi, 'macd': self._macd, 'bbands': self._bbands, 'atr': self._atr, 'cross': self._cross, 'crossover': self._crossover }

---

### `services/signal.py`
**Lines:** 1

---

### `services/levels.py`
**Lines:** 44

---

### `services/csv_service.py`
**Lines:** 114

#### Classes:
- **CSVResponseService** (Line 12)
  - Convert signals JSON response to DataFrame signals_list = signals_data.get('signals', [])  # Create DataFrame df = pd.DataFrame(signals_list)  # Add metadata columns df['export_timestamp'] = datetime.now().isoformat() df['data_source'] = 'fake_algorithm'  return df  def generate_csv_response(self, signals_data: Dict, filename: str = None) -> Response: Generate FastAPI CSV Response from signals data

#### Functions:
- **__init__** (Line 13)
  - Convert signals JSON response to DataFrame signals_list = signals_data.get('signals', [])  # Create DataFrame df = pd.DataFrame(signals_list)  # Add metadata columns df['export_timestamp'] = datetime.now().isoformat() df['data_source'] = 'fake_algorithm'  return df  def generate_csv_response(self, signals_data: Dict, filename: str = None) -> Response: Generate FastAPI CSV Response from signals data
- **convert_signals_to_dataframe** (Line 17)
  - Convert signals JSON response to DataFrame signals_list = signals_data.get('signals', [])  # Create DataFrame df = pd.DataFrame(signals_list)  # Add metadata columns df['export_timestamp'] = datetime.now().isoformat() df['data_source'] = 'fake_algorithm'  return df  def generate_csv_response(self, signals_data: Dict, filename: str = None) -> Response: Generate FastAPI CSV Response from signals data
- **generate_csv_response** (Line 30)
  - Generate FastAPI CSV Response from signals data try: df = self.convert_signals_to_dataframe(signals_data)  if filename is None: timestamp = datetime.now().strftime("%Y%m%d_%H%M%S") filename = f"trading_signals_{timestamp}.csv"  # Convert to CSV csv_content = df.to_csv(index=False)  # Create FastAPI Response response = Response( content=csv_content, media_type="text/csv", headers={ "Content-Disposition": f"attachment; filename={filename}", "Access-Control-Expose-Headers": "Content-Disposition" } )  logger.info(f"Generated CSV response with {len(df)} signals") return response  except Exception as e: logger.error(f"Error generating CSV response: {e}") return Response( content="Error generating CSV", status_code=500, media_type="text/plain" )  def save_signals_to_daily_csv(self, signals_data: Dict) -> str: Save signals to daily CSV file (24-hour basis)
- **save_signals_to_daily_csv** (Line 63)
  - Save signals to daily CSV file (24-hour basis) try: df = self.convert_signals_to_dataframe(signals_data)  # Generate filename based on current date date_str = datetime.now().strftime("%Y-%m-%d") filename = self.output_dir / f"daily_signals_{date_str}.csv"  # Check if file exists to append or create new if filename.exists(): existing_df = pd.read_csv(filename) combined_df = pd.concat([existing_df, df], ignore_index=True) combined_df.to_csv(filename, index=False) mode = "appended" else: df.to_csv(filename, index=False) mode = "created"  logger.info(f"Daily CSV {mode}: {filename} with {len(df)} new signals") return str(filename)  except Exception as e: logger.error(f"Error saving to daily CSV: {e}") return None  def get_daily_csv_content(self, date_str: str = None) -> str: Get content of daily CSV file
- **get_daily_csv_content** (Line 89)
  - Get content of daily CSV file if date_str is None: date_str = datetime.now().strftime("%Y-%m-%d")  filename = self.output_dir / f"daily_signals_{date_str}.csv"  if not filename.exists(): return None  return filename.read_text()  def list_available_csv_files(self) -> List[Dict]: List all available CSV files
- **list_available_csv_files** (Line 101)
  - List all available CSV files csv_files = [] for file_path in self.output_dir.glob("daily_signals_*.csv"): stats = file_path.stat() csv_files.append({ 'filename': file_path.name, 'file_path': str(file_path), 'file_size': stats.st_size, 'created_date': datetime.fromtimestamp(stats.st_ctime).isoformat(), 'modified_date': datetime.fromtimestamp(stats.st_mtime).isoformat() })  return sorted(csv_files, key=lambda x: x['filename'], reverse=True)

---

### `services/algo_service.py`
**Lines:** 76

#### Classes:
- **AlgorithmService** (Line 10)
  - Analyze symbols and return signals signals = []  for symbol in symbols: result = self.algorithm.fake_secret_algorithm(symbol)  if result: signals.append(result) else: # Add HOLD signal when no signal generated signals.append({ "signal": "HOLD", "symbol": symbol, "price": 0.0, "type": "NO_SIGNAL", "confidence": 0, "timestamp": datetime.now().isoformat() })  return { "signals": signals, "last_updated": datetime.now().isoformat() }  def analyze_symbols_to_csv_response(self, symbols: List[str]) -> Response: Analyze symbols and return CSV response

#### Functions:
- **__init__** (Line 11)
  - Analyze symbols and return signals signals = []  for symbol in symbols: result = self.algorithm.fake_secret_algorithm(symbol)  if result: signals.append(result) else: # Add HOLD signal when no signal generated signals.append({ "signal": "HOLD", "symbol": symbol, "price": 0.0, "type": "NO_SIGNAL", "confidence": 0, "timestamp": datetime.now().isoformat() })  return { "signals": signals, "last_updated": datetime.now().isoformat() }  def analyze_symbols_to_csv_response(self, symbols: List[str]) -> Response: Analyze symbols and return CSV response
- **analyze_symbols** (Line 16)
  - Analyze symbols and return signals signals = []  for symbol in symbols: result = self.algorithm.fake_secret_algorithm(symbol)  if result: signals.append(result) else: # Add HOLD signal when no signal generated signals.append({ "signal": "HOLD", "symbol": symbol, "price": 0.0, "type": "NO_SIGNAL", "confidence": 0, "timestamp": datetime.now().isoformat() })  return { "signals": signals, "last_updated": datetime.now().isoformat() }  def analyze_symbols_to_csv_response(self, symbols: List[str]) -> Response: Analyze symbols and return CSV response
- **analyze_symbols_to_csv_response** (Line 41)
  - Analyze symbols and return CSV response try: signals_data = self.analyze_symbols(symbols) signals_list = signals_data.get('signals', [])  # Create DataFrame df = pd.DataFrame(signals_list)  # Add export timestamp df['export_timestamp'] = datetime.now().isoformat() df['data_source'] = 'fake_algorithm'  # Convert to CSV csv_content = df.to_csv(index=False)  # Create filename timestamp = datetime.now().strftime("%Y%m%d_%H%M%S") filename = f"trading_signals_{timestamp}.csv"  return Response( content=csv_content, media_type="text/csv", headers={ "Content-Disposition": f"attachment; filename={filename}", "Access-Control-Expose-Headers": "Content-Disposition" } )  except Exception as e: logger.error(f"Error generating CSV response: {e}") return Response( content="Error generating CSV", status_code=500, media_type="text/plain" )

---

### `services/backtest_engine.py`
**Lines:** 369

#### Classes:
- **BacktestEngine** (Line 8)
  - Execute real backtest with user's strategy try: # Extract parameters symbol = backtest_request.get('symbol', 'RELIANCE') timeframe = self._convert_timeframe(backtest_request.get('timeframe', '1d')) start_date = backtest_request.get('start_date', '2023-01-01') end_date = backtest_request.get('end_date', '2023-12-31') strategy_code = backtest_request.get('strategy_code', '') language = backtest_request.get('language', 'pine_script')  self.initial_capital = backtest_request.get('parameters', {}).get('initial_capital', 100000) self.current_cash = self.initial_capital self.trades = [] self.positions = {}  print(f"🔍 Fetching data for {symbol} from {start_date} to {end_date}")  # Fetch REAL historical data data = await self._fetch_historical_data(symbol, timeframe, start_date, end_date)  if data.empty: return {"error": f"No historical data found for {symbol}"}  print(f"✅ Data fetched: {len(data)} records")  # Execute strategy based on language if language == 'pine_script': trades = await self._execute_pine_script(strategy_code, data) elif language == 'python': trades = await self._execute_python_strategy(strategy_code, data) else: return {"error": f"Unsupported language: {language}"}  # Calculate REAL performance metrics metrics = self._calculate_performance_metrics(trades)  return { "total_trades": len(trades), "winning_trades": len([t for t in trades if t.get('pnl', 0) > 0]), "losing_trades": len([t for t in trades if t.get('pnl', 0) < 0]), "trades": trades[-10:],  # Last 10 trades for display "metrics": metrics, "data_points": len(data), "final_capital": self.current_cash }  except Exception as e: print(f"❌ Backtest error: {str(e)}") return {"error": f"Backtest execution failed: {str(e)}"}  def _convert_timeframe(self, tf: str) -> str: Convert timeframe to yfinance format

#### Functions:
- **__init__** (Line 9)
  - Execute real backtest with user's strategy try: # Extract parameters symbol = backtest_request.get('symbol', 'RELIANCE') timeframe = self._convert_timeframe(backtest_request.get('timeframe', '1d')) start_date = backtest_request.get('start_date', '2023-01-01') end_date = backtest_request.get('end_date', '2023-12-31') strategy_code = backtest_request.get('strategy_code', '') language = backtest_request.get('language', 'pine_script')  self.initial_capital = backtest_request.get('parameters', {}).get('initial_capital', 100000) self.current_cash = self.initial_capital self.trades = [] self.positions = {}  print(f"🔍 Fetching data for {symbol} from {start_date} to {end_date}")  # Fetch REAL historical data data = await self._fetch_historical_data(symbol, timeframe, start_date, end_date)  if data.empty: return {"error": f"No historical data found for {symbol}"}  print(f"✅ Data fetched: {len(data)} records")  # Execute strategy based on language if language == 'pine_script': trades = await self._execute_pine_script(strategy_code, data) elif language == 'python': trades = await self._execute_python_strategy(strategy_code, data) else: return {"error": f"Unsupported language: {language}"}  # Calculate REAL performance metrics metrics = self._calculate_performance_metrics(trades)  return { "total_trades": len(trades), "winning_trades": len([t for t in trades if t.get('pnl', 0) > 0]), "losing_trades": len([t for t in trades if t.get('pnl', 0) < 0]), "trades": trades[-10:],  # Last 10 trades for display "metrics": metrics, "data_points": len(data), "final_capital": self.current_cash }  except Exception as e: print(f"❌ Backtest error: {str(e)}") return {"error": f"Backtest execution failed: {str(e)}"}  def _convert_timeframe(self, tf: str) -> str: Convert timeframe to yfinance format
- **_convert_timeframe** (Line 67)
  - Convert timeframe to yfinance format conversions = { '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '1d': '1d', '1wk': '1wk', '1mo': '1mo' } return conversions.get(tf, '1d')  async def _fetch_historical_data(self, symbol: str, timeframe: str, start_date: str, end_date: str) -> pd.DataFrame: Fetch REAL historical data from yfinance
- **_add_technical_indicators** (Line 162)
  - Add REAL technical indicators to data # RSI data['rsi'] = self._calculate_rsi(data['Close'], 14)  # Moving Averages data['sma_20'] = data['Close'].rolling(20).mean() data['sma_50'] = data['Close'].rolling(50).mean()  # EMA data['ema_12'] = data['Close'].ewm(span=12).mean() data['ema_26'] = data['Close'].ewm(span=26).mean()  return data  def _parse_pine_signals(self, code: str, data: pd.DataFrame, current_index: int) -> str: Parse Pine Script code to generate REAL signals
- **_parse_pine_signals** (Line 177)
  - Parse Pine Script code to generate REAL signals if current_index < 20:  # Need enough data for indicators return "HOLD"  current_bar = data.iloc[current_index] prev_bar = data.iloc[current_index-1]  # Calculate RSI if not already in data if 'rsi' not in data.columns: data['rsi'] = self._calculate_rsi(data['Close'], 14)  current_rsi = data['rsi'].iloc[current_index] if current_index < len(data) else 50 prev_rsi = data['rsi'].iloc[current_index-1] if current_index > 0 else 50  # 🚨 DEBUG: Print RSI values to see what's happening if current_index % 10 == 0:  # Print every 10th bar print(f"📊 Bar {current_index}: RSI = {current_rsi:.2f}")  # RSI Strategy Logic if pd.notna(prev_rsi) and pd.notna(current_rsi): # Buy when RSI crosses above 30 (oversold) if prev_rsi < 30 and current_rsi >= 30: print(f"🎯 BUY SIGNAL: RSI {prev_rsi:.1f} -> {current_rsi:.1f}") return "BUY" # Sell when RSI crosses below 70 (overbought) elif prev_rsi > 70 and current_rsi <= 70: print(f"🎯 SELL SIGNAL: RSI {prev_rsi:.1f} -> {current_rsi:.1f}") return "SELL"  return "HOLD"   def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series: Calculate REAL RSI indicator
- **_calculate_rsi** (Line 210)
  - Calculate REAL RSI indicator delta = prices.diff() gain = (delta.where(delta > 0, 0)).rolling(window=period).mean() loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean() rs = gain / loss rsi = 100 - (100 / (1 + rs)) return rsi  async def _execute_python_strategy(self, code: str, data: pd.DataFrame) -> List[Dict]: Execute Python strategy with REAL data
- **_calculate_position_size** (Line 290)
  - Calculate REAL position size based on available capital return max(1, int((self.current_cash * 0.1) / price))  # 10% of capital per trade  def _calculate_performance_metrics(self, trades: List[Dict]) -> Dict[str, Any]: Calculate REAL performance metrics
- **_calculate_performance_metrics** (Line 294)
  - Calculate REAL performance metrics if not trades: return { "total_return_pct": 0, "total_pnl": 0, "win_rate": 0, "profit_factor": 0, "max_drawdown_pct": 0, "sharpe_ratio": 0 }  # Calculate total P&L from closed trades (with sell actions) closed_trades = [t for t in trades if t['action'] == 'SELL'] total_pnl = sum(t.get('pnl', 0) for t in closed_trades)  winning_trades = [t for t in closed_trades if t.get('pnl', 0) > 0] losing_trades = [t for t in closed_trades if t.get('pnl', 0) < 0]  win_rate = (len(winning_trades) / len(closed_trades)) * 100 if closed_trades else 0  total_gains = sum(t.get('pnl', 0) for t in winning_trades) total_losses = abs(sum(t.get('pnl', 0) for t in losing_trades)) profit_factor = total_gains / total_losses if total_losses > 0 else float('inf')  return { "total_return_pct": round((total_pnl / self.initial_capital) * 100, 2), "total_pnl": round(total_pnl, 2), "win_rate": round(win_rate, 2), "profit_factor": round(profit_factor, 2) if profit_factor != float('inf') else "Infinite", "max_drawdown_pct": round(self._calculate_max_drawdown(trades), 2), "sharpe_ratio": round(self._calculate_sharpe_ratio(trades), 2), "total_commission": round(sum(t.get('commission', 0) for t in trades), 2), "net_profit": round(total_pnl - sum(t.get('commission', 0) for t in trades), 2) }  def _calculate_max_drawdown(self, trades: List[Dict]) -> float: Calculate REAL max drawdown
- **_calculate_max_drawdown** (Line 330)
  - Calculate REAL max drawdown if not trades: return 0  equity = self.initial_capital peak = equity max_drawdown = 0  for trade in trades: if trade['action'] == 'BUY': equity -= (trade['price'] * trade['quantity'] + trade.get('commission', 0)) else:  # SELL equity += (trade['price'] * trade['quantity'] - trade.get('commission', 0)) equity += trade.get('pnl', 0)  if equity > peak: peak = equity  drawdown = (peak - equity) / peak * 100 if drawdown > max_drawdown: max_drawdown = drawdown  return max_drawdown  def _calculate_sharpe_ratio(self, trades: List[Dict]) -> float: Calculate REAL Sharpe ratio (simplified)
- **_calculate_sharpe_ratio** (Line 355)
  - Calculate REAL Sharpe ratio (simplified) if len(trades) < 2: return 0  # Simplified implementation returns = [t.get('pnl', 0) / self.initial_capital for t in trades if t.get('pnl', 0) != 0]  if len(returns) < 2: return 0  avg_return = np.mean(returns) std_return = np.std(returns)  return avg_return / std_return * np.sqrt(252) if std_return != 0 else 0

---

### `services/strategy_templates.py`
**Lines:** 68

#### Classes:
- **StrategyTemplates** (Line 5)
  - , "description": "Basic RSI strategy with oversold/overbought levels" }, "moving_average_cross": { "name": "Moving Average Crossover", "language": "python", "code": """ def strategy(data, params): fast_period = params.get('fast_period', 10) slow_period = params.get('slow_period', 20)  data['fast_ma'] = data['close'].rolling(fast_period).mean() data['slow_ma'] = data['close'].rolling(slow_period).mean()  trades = [] position = 0  for i in range(slow_period, len(data)): if data['fast_ma'].iloc[i] > data['slow_ma'].iloc[i] and position <= 0: # Buy signal trades.append({ 'timestamp': data.index[i], 'action': 'buy', 'price': data['close'].iloc[i] }) position = 1 elif data['fast_ma'].iloc[i] < data['slow_ma'].iloc[i] and position >= 0: # Sell signal trades.append({ 'timestamp': data.index[i], 'action': 'sell', 'price': data['close'].iloc[i] }) position = -1  return trades ,

#### Functions:
- **get_templates** (Line 7)
  - , "description": "Basic RSI strategy with oversold/overbought levels" }, "moving_average_cross": { "name": "Moving Average Crossover", "language": "python", "code": """ def strategy(data, params): fast_period = params.get('fast_period', 10) slow_period = params.get('slow_period', 20)  data['fast_ma'] = data['close'].rolling(fast_period).mean() data['slow_ma'] = data['close'].rolling(slow_period).mean()  trades = [] position = 0  for i in range(slow_period, len(data)): if data['fast_ma'].iloc[i] > data['slow_ma'].iloc[i] and position <= 0: # Buy signal trades.append({ 'timestamp': data.index[i], 'action': 'buy', 'price': data['close'].iloc[i] }) position = 1 elif data['fast_ma'].iloc[i] < data['slow_ma'].iloc[i] and position >= 0: # Sell signal trades.append({ 'timestamp': data.index[i], 'action': 'sell', 'price': data['close'].iloc[i] }) position = -1  return trades ,
- **strategy** (Line 36)
  - , "description": "Classic moving average crossover strategy" } }

---

### `services/user.py`
**Lines:** 172

#### Functions:
- **verify_password** (Line 19)
  - Update user role (only admins can do this) allowed_roles = ["user", "agency", "admin"] if role not in allowed_roles: raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role must be one of {allowed_roles}" )  if current_user.role != "admin": raise HTTPException( status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update user roles" )  result = await users_collection.update_one( {"email": email}, {"$set": {"role": role, "updated_at": datetime.now().isoformat()}} )  if result.modified_count == 0: raise HTTPException( status_code=status.HTTP_404_NOT_FOUND, detail="User not found" )  return {"message": f"User role updated to {role}"}  async def get_all_users(current_user: UserInDB): Get all users (admin only)
- **get_password_hash** (Line 22)
  - Update user role (only admins can do this) allowed_roles = ["user", "agency", "admin"] if role not in allowed_roles: raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role must be one of {allowed_roles}" )  if current_user.role != "admin": raise HTTPException( status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update user roles" )  result = await users_collection.update_one( {"email": email}, {"$set": {"role": role, "updated_at": datetime.now().isoformat()}} )  if result.modified_count == 0: raise HTTPException( status_code=status.HTTP_404_NOT_FOUND, detail="User not found" )  return {"message": f"User role updated to {role}"}  async def get_all_users(current_user: UserInDB): Get all users (admin only)
- **create_access_token** (Line 25)
  - Update user role (only admins can do this) allowed_roles = ["user", "agency", "admin"] if role not in allowed_roles: raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role must be one of {allowed_roles}" )  if current_user.role != "admin": raise HTTPException( status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update user roles" )  result = await users_collection.update_one( {"email": email}, {"$set": {"role": role, "updated_at": datetime.now().isoformat()}} )  if result.modified_count == 0: raise HTTPException( status_code=status.HTTP_404_NOT_FOUND, detail="User not found" )  return {"message": f"User role updated to {role}"}  async def get_all_users(current_user: UserInDB): Get all users (admin only)
- **create_refresh_token** (Line 35)
  - Update user role (only admins can do this) allowed_roles = ["user", "agency", "admin"] if role not in allowed_roles: raise HTTPException( status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role must be one of {allowed_roles}" )  if current_user.role != "admin": raise HTTPException( status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update user roles" )  result = await users_collection.update_one( {"email": email}, {"$set": {"role": role, "updated_at": datetime.now().isoformat()}} )  if result.modified_count == 0: raise HTTPException( status_code=status.HTTP_404_NOT_FOUND, detail="User not found" )  return {"message": f"User role updated to {role}"}  async def get_all_users(current_user: UserInDB): Get all users (admin only)

---

### `services/price_algorithm.py`
**Lines:** 215

#### Classes:
- **ExcelSignalTrigger** (Line 12)
  - Load stock target levels from Excel file try: # Read Excel file, skip the first row if it contains headers df = pd.read_excel(self.excel_file, header=0)  # Clean column names (remove extra spaces and make lowercase) df.columns = df.columns.str.strip().str.lower()  # Extract relevant columns - adjust column names based on your Excel structure # Assuming columns: 'stock name', 'levels', 'ltp' self.stock_data = df[['stock name', 'levels', 'ltp']].copy()  # Clean stock names and convert to NSE format self.stock_data['stock name'] = self.stock_data['stock name'].astype(str).str.strip()  # Add .NS suffix for NSE stocks (adjust if needed for other exchanges) self.stock_data['symbol'] = self.stock_data['stock name'] + '.NS'  logging.info(f"Loaded {len(self.stock_data)} stocks from Excel") logging.info(f"Sample stocks: {self.stock_data['stock name'].head().tolist()}")  except Exception as e: logging.error(f"Error loading Excel file: {e}") raise  def get_current_price(self, symbol): Get current market price using yfinance

#### Functions:
- **__init__** (Line 13)
  - Load stock target levels from Excel file try: # Read Excel file, skip the first row if it contains headers df = pd.read_excel(self.excel_file, header=0)  # Clean column names (remove extra spaces and make lowercase) df.columns = df.columns.str.strip().str.lower()  # Extract relevant columns - adjust column names based on your Excel structure # Assuming columns: 'stock name', 'levels', 'ltp' self.stock_data = df[['stock name', 'levels', 'ltp']].copy()  # Clean stock names and convert to NSE format self.stock_data['stock name'] = self.stock_data['stock name'].astype(str).str.strip()  # Add .NS suffix for NSE stocks (adjust if needed for other exchanges) self.stock_data['symbol'] = self.stock_data['stock name'] + '.NS'  logging.info(f"Loaded {len(self.stock_data)} stocks from Excel") logging.info(f"Sample stocks: {self.stock_data['stock name'].head().tolist()}")  except Exception as e: logging.error(f"Error loading Excel file: {e}") raise  def get_current_price(self, symbol): Get current market price using yfinance
- **load_excel_data** (Line 19)
  - Load stock target levels from Excel file try: # Read Excel file, skip the first row if it contains headers df = pd.read_excel(self.excel_file, header=0)  # Clean column names (remove extra spaces and make lowercase) df.columns = df.columns.str.strip().str.lower()  # Extract relevant columns - adjust column names based on your Excel structure # Assuming columns: 'stock name', 'levels', 'ltp' self.stock_data = df[['stock name', 'levels', 'ltp']].copy()  # Clean stock names and convert to NSE format self.stock_data['stock name'] = self.stock_data['stock name'].astype(str).str.strip()  # Add .NS suffix for NSE stocks (adjust if needed for other exchanges) self.stock_data['symbol'] = self.stock_data['stock name'] + '.NS'  logging.info(f"Loaded {len(self.stock_data)} stocks from Excel") logging.info(f"Sample stocks: {self.stock_data['stock name'].head().tolist()}")  except Exception as e: logging.error(f"Error loading Excel file: {e}") raise  def get_current_price(self, symbol): Get current market price using yfinance
- **get_current_price** (Line 45)
  - Get current market price using yfinance try: stock = yf.Ticker(symbol) # Get the latest price current_data = stock.history(period='1d', interval='1m') if not current_data.empty: return current_data['Close'].iloc[-1] else: # Fallback to info if history fails info = stock.info return info.get('regularMarketPrice', info.get('currentPrice', None)) except Exception as e: logging.error(f"Error fetching price for {symbol}: {e}") return None  def check_price_levels(self): Check if current prices hit target levels and trigger signals
- **check_price_levels** (Line 61)
  - Check if current prices hit target levels and trigger signals current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S") logging.info(f"Checking price levels at {current_time}")  triggered_count = 0  for index, row in self.stock_data.iterrows(): stock_name = row['stock name'] symbol = row['symbol'] target_level = row['levels'] current_excel_ltp = row['ltp']  # Skip if target level is not valid if pd.isna(target_level) or target_level <= 0: continue  # Get current market price current_market_price = self.get_current_price(symbol)  if current_market_price is None: logging.warning(f"Could not fetch price for {stock_name}") continue  # Create unique identifier for this signal signal_id = f"{stock_name}_{target_level}"  # Check if price hit the target level (with 0.1% tolerance) price_diff_percent = abs((current_market_price - target_level) / target_level * 100)  if price_diff_percent <= 0.1 and signal_id not in self.triggered_signals: # Trigger signal self.trigger_signal(stock_name, target_level, current_market_price, current_excel_ltp) self.triggered_signals.add(signal_id) triggered_count += 1 elif price_diff_percent <= 1.0:  # Within 1% of target logging.info(f"{stock_name}: Current ₹{current_market_price:.2f} approaching target ₹{target_level:.2f} " f"(diff: {price_diff_percent:.2f}%)")  if triggered_count == 0: logging.info("No new triggers in this check")  def trigger_signal(self, stock_name, target_level, current_price, excel_ltp): Execute the signal trigger action
- **trigger_signal** (Line 103)
  - Execute the signal trigger action signal_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  message = f""" 🚨 SIGNAL TRIGGERED 🚨 Time: {signal_time} Stock: {stock_name} Target Level: ₹{target_level:.2f} Current Market Price: ₹{current_price:.2f} Excel LTP: ₹{excel_ltp:.2f} Action: PRICE TARGET HIT!
- **execute_trading_signal** (Line 127)
  - Placeholder for actual trading execution # Implement your broker API integration here # Example: # broker.place_order(stock_name, quantity, "BUY", current_price)  logging.info(f"EXECUTING TRADE: {stock_name} at ₹{current_price:.2f}")  # Example implementation (pseudo-code):
- **update_excel_ltp** (Line 150)
  - Update LTP column in Excel with current market prices try: for index, row in self.stock_data.iterrows(): symbol = row['symbol'] current_price = self.get_current_price(symbol)  if current_price: self.stock_data.at[index, 'ltp'] = current_price  # Save updated data back to Excel (optional) # self.stock_data.to_excel('updated_stock_data.xlsx', index=False) logging.info("LTP data updated with current market prices")  except Exception as e: logging.error(f"Error updating LTP: {e}")  # Scheduler Setup def setup_scheduler(): signal_trigger = ExcelSignalTrigger('weekly (2).xlsx')  # Schedule frequent price checks during market hours schedule.every(1).minutes.do(signal_trigger.check_price_levels).tag('price_check')  # Update Excel LTP less frequently schedule.every(30).minutes.do(signal_trigger.update_excel_ltp).tag('ltp_update')  # Daily reset of triggered signals (for new trading day) schedule.every().day.at("09:00").do( lambda: signal_trigger.triggered_signals.clear() ).tag('daily_reset')  return signal_trigger  def main(): Main execution function
- **setup_scheduler** (Line 168)
  - Main execution function logging.info("Starting Excel-based Signal Trigger System")  try: signal_trigger = setup_scheduler()  # Initial check signal_trigger.check_price_levels()  # Main loop while True: schedule.run_pending() time.sleep(1)  except KeyboardInterrupt: logging.info("System stopped by user") except Exception as e: logging.error(f"System error: {e}")  # Alternative: One-time execution without scheduler def run_single_check(): Run a single price check (useful for testing)
- **main** (Line 184)
  - Main execution function logging.info("Starting Excel-based Signal Trigger System")  try: signal_trigger = setup_scheduler()  # Initial check signal_trigger.check_price_levels()  # Main loop while True: schedule.run_pending() time.sleep(1)  except KeyboardInterrupt: logging.info("System stopped by user") except Exception as e: logging.error(f"System error: {e}")  # Alternative: One-time execution without scheduler def run_single_check(): Run a single price check (useful for testing)
- **run_single_check** (Line 205)
  - Run a single price check (useful for testing) signal_trigger = ExcelSignalTrigger('weekly (2).xlsx') signal_trigger.check_price_levels()  if __name__ == "__main__": # For testing run_single_check()  # For continuous operation # main()

---

### `services/enhanced_algorithm.py`
**Lines:** 387

#### Classes:
- **EnhancedTradingAlgorithm** (Line 13)
  - Simple Moving Average return data.rolling(window=window).mean()  def calculate_ema(self, data: pd.Series, window: int) -> pd.Series: Exponential Moving Average

#### Functions:
- **__init__** (Line 14)
  - Simple Moving Average return data.rolling(window=window).mean()  def calculate_ema(self, data: pd.Series, window: int) -> pd.Series: Exponential Moving Average
- **calculate_sma** (Line 22)
  - Simple Moving Average return data.rolling(window=window).mean()  def calculate_ema(self, data: pd.Series, window: int) -> pd.Series: Exponential Moving Average
- **calculate_ema** (Line 26)
  - Exponential Moving Average return data.ewm(span=window, adjust=False).mean()  def calculate_rsi(self, data: pd.Series, window: int = 14) -> pd.Series: Relative Strength Index
- **calculate_rsi** (Line 30)
  - Relative Strength Index delta = data.diff() gain = (delta.where(delta > 0, 0)).rolling(window=window).mean() loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean() rs = gain / loss rsi = 100 - (100 / (1 + rs)) return rsi  def calculate_macd(self, data: pd.Series) -> tuple: MACD Indicator
- **calculate_macd** (Line 39)
  - MACD Indicator ema_12 = self.calculate_ema(data, 12) ema_26 = self.calculate_ema(data, 26) macd = ema_12 - ema_26 signal = self.calculate_ema(macd, 9) histogram = macd - signal return macd, signal, histogram  def calculate_bollinger_bands(self, data: pd.Series, window: int = 20) -> tuple: Bollinger Bands
- **calculate_bollinger_bands** (Line 48)
  - Bollinger Bands sma = self.calculate_sma(data, window) std = data.rolling(window=window).std() upper_band = sma + (std * 2) lower_band = sma - (std * 2) return upper_band, sma, lower_band  def get_enhanced_price_data(self, symbol: str, period: str = "5d", interval: str = "15m") -> Optional[Dict]: Get comprehensive price data with multiple fallbacks
- **get_enhanced_price_data** (Line 56)
  - Get comprehensive price data with multiple fallbacks try: stock = yf.Ticker(symbol)  # Try 15-minute data first hist = stock.history(period=period, interval=interval)  if len(hist) > 20: current_price = hist['Close'].iloc[-1] return { 'price': current_price, 'data': hist, 'reliable': True, 'volume': hist['Volume'].iloc[-1] if 'Volume' in hist else 0 }  # Fallback to 1-hour data hist = stock.history(period="5d", interval="1h") if len(hist) > 10: current_price = hist['Close'].iloc[-1] return { 'price': current_price, 'data': hist, 'reliable': True, 'volume': hist['Volume'].iloc[-1] if 'Volume' in hist else 0 }  # Final fallback info = stock.info current_price = info.get('regularMarketPrice', info.get('currentPrice', info.get('previousClose', 0)))  if current_price and current_price > 0: return { 'price': current_price, 'data': None, 'reliable': False, 'volume': 0 }  except Exception as e: logger.warning(f"Price data error for {symbol}: {e}")  return None  def calculate_technical_indicators(self, hist_data: pd.DataFrame) -> Dict: Calculate multiple technical indicators
- **calculate_technical_indicators** (Line 103)
  - Calculate multiple technical indicators if hist_data is None or len(hist_data) < 20: return {}  try: closes = hist_data['Close']  indicators = {}  # Trend Indicators indicators['sma_20'] = self.calculate_sma(closes, 20).iloc[-1] indicators['sma_50'] = self.calculate_sma(closes, 50).iloc[-1] if len(closes) >= 50 else closes.iloc[-1] indicators['ema_12'] = self.calculate_ema(closes, 12).iloc[-1] indicators['ema_26'] = self.calculate_ema(closes, 26).iloc[-1]  # Momentum Indicators indicators['rsi'] = self.calculate_rsi(closes, 14).iloc[-1] macd, macd_signal, macd_hist = self.calculate_macd(closes) indicators['macd'] = macd.iloc[-1] indicators['macd_signal'] = macd_signal.iloc[-1] indicators['macd_hist'] = macd_hist.iloc[-1]  # Volatility Indicators bb_upper, bb_middle, bb_lower = self.calculate_bollinger_bands(closes, 20) indicators['bb_upper'] = bb_upper.iloc[-1] indicators['bb_middle'] = bb_middle.iloc[-1] indicators['bb_lower'] = bb_lower.iloc[-1]  # Volume Analysis if 'Volume' in hist_data: volume = hist_data['Volume'] indicators['volume_sma'] = self.calculate_sma(volume, 20).iloc[-1] indicators['current_volume'] = volume.iloc[-1] indicators['volume_ratio'] = volume.iloc[-1] / indicators['volume_sma'] if indicators['volume_sma'] > 0 else 1  return indicators  except Exception as e: logger.warning(f"Technical indicator calculation error: {e}") return {}  def multi_timeframe_analysis(self, symbol: str) -> Dict: Analyze multiple timeframes for better signal confirmation
- **multi_timeframe_analysis** (Line 145)
  - Analyze multiple timeframes for better signal confirmation try: price_data = self.get_enhanced_price_data(symbol) if not price_data or not price_data['reliable']: return {"signal": "HOLD", "confidence": 0, "reason": "Insufficient data"}  current_price = price_data['price'] hist_data = price_data['data']  # Calculate technical indicators indicators = self.calculate_technical_indicators(hist_data) if not indicators: return {"signal": "HOLD", "confidence": 0, "reason": "Indicator calculation failed"}  # Multi-factor scoring system buy_score = 0 sell_score = 0 max_score = 100  # Total possible score  # 1. Trend Analysis (30 points) if indicators['sma_20'] > indicators['sma_50']: buy_score += 30 else: sell_score += 30  # 2. RSI Momentum (25 points) if indicators['rsi'] < 30:  # Oversold buy_score += 25 elif indicators['rsi'] > 70:  # Overbought sell_score += 25 # If RSI between 30-70, no points awarded  # 3. MACD Signal (25 points) if indicators['macd'] > indicators['macd_signal']: buy_score += 25 else: sell_score += 25  # 4. Bollinger Bands Position (20 points) if current_price <= indicators['bb_lower'] * 1.02:  # Near lower band buy_score += 20 elif current_price >= indicators['bb_upper'] * 0.98:  # Near upper band sell_score += 20  # Determine signal and confidence if buy_score > sell_score: signal = "BUY" confidence = min(95, int((buy_score / max_score) * 100)) elif sell_score > buy_score: signal = "SELL" confidence = min(95, int((sell_score / max_score) * 100)) else: signal = "HOLD" confidence = 0  # Volume confirmation boost if 'volume_ratio' in indicators and indicators['volume_ratio'] > 1.2: confidence = min(95, confidence + 10)  return { "signal": signal, "confidence": confidence, "indicators": indicators, "price": current_price }  except Exception as e: logger.error(f"Multi-timeframe analysis error for {symbol}: {e}") return {"signal": "HOLD", "confidence": 0, "reason": f"Analysis error: {e}"}  def calculate_position_size(self, price: float, confidence: int) -> int: Dynamic position sizing based on confidence
- **calculate_position_size** (Line 216)
  - Dynamic position sizing based on confidence risk_per_trade = 0.02  # Risk 2% of capital per trade risk_amount = self.current_capital * risk_per_trade  # Adjust for confidence confidence_multiplier = confidence / 100 position_size = int((risk_amount * confidence_multiplier) / price)  return max(1, min(50, position_size))  # Limit between 1 and 50 shares  def calculate_exit_prices(self, signal: str, entry_price: float) -> Tuple[float, float]: Calculate stop loss and take profit
- **calculate_exit_prices** (Line 227)
  - Calculate stop loss and take profit if signal == "BUY": stop_loss = entry_price * (1 - self.base_stop_loss) take_profit = entry_price * (1 + self.base_take_profit) else:  # SELL stop_loss = entry_price * (1 + self.base_stop_loss) take_profit = entry_price * (1 - self.base_take_profit)  return stop_loss, take_profit  def generate_orders(self, signal: str, symbol: str, price: float, quantity: int, stop_loss: float, take_profit: float) -> List[Dict]: Generate comprehensive order structure
- **generate_orders** (Line 238)
  - Generate comprehensive order structure orders = [] timestamp = datetime.utcnow().isoformat() base_id = f"{symbol}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"  if signal == "BUY": # Main entry order orders.append({ "order_id": f"{base_id}_MARKET_BUY", "symbol": symbol, "order_type": "MARKET_ORDER", "action": "BUY", "quantity": quantity, "price": "MARKET_PRICE", "estimated_price": round(price, 2), "timestamp": timestamp })  # Stop loss orders.append({ "order_id": f"{base_id}_STOP_LOSS_SELL", "symbol": symbol, "order_type": "STOP_MARKET_SELL", "action": "SELL", "quantity": quantity, "stop_price": round(stop_loss, 2), "timestamp": timestamp })  # Take profit orders.append({ "order_id": f"{base_id}_TAKE_PROFIT_SELL", "symbol": symbol, "order_type": "LIMIT_SELL", "action": "SELL", "quantity": quantity, "limit_price": round(take_profit, 2), "timestamp": timestamp })  elif signal == "SELL": # Main entry order orders.append({ "order_id": f"{base_id}_MARKET_SELL", "symbol": symbol, "order_type": "MARKET_ORDER", "action": "SELL", "quantity": quantity, "price": "MARKET_PRICE", "estimated_price": round(price, 2), "timestamp": timestamp })  # Stop loss orders.append({ "order_id": f"{base_id}_STOP_LOSS_BUY", "symbol": symbol, "order_type": "STOP_MARKET_BUY", "action": "BUY", "quantity": quantity, "stop_price": round(stop_loss, 2), "timestamp": timestamp })  # Take profit orders.append({ "order_id": f"{base_id}_TAKE_PROFIT_BUY", "symbol": symbol, "order_type": "LIMIT_BUY", "action": "BUY", "quantity": quantity, "limit_price": round(take_profit, 2), "timestamp": timestamp })  return orders  def enhanced_trading_algorithm(self, symbol: str) -> Dict:
- **enhanced_trading_algorithm** (Line 317)
  - Main enhanced trading algorithm
- **enhanced_trading_algorithm** (Line 385)
  - Main function for external use return _algo_instance.enhanced_trading_algorithm(symbol)

---

### `services/live_strategy_monitor.py`
**Lines:** 37

#### Classes:
- **LiveStrategyMonitor** (Line 7)
  - Start live paper trading for a strategy while True: # Get real-time market data market_data = await self._get_live_data()  # Execute user's strategy signals = await self._execute_strategy_live(strategy_id, market_data)  # Execute paper trades for signal in signals: await self._execute_paper_trade(user_id, signal)  await asyncio.sleep(60)  # Check every minute  async def _execute_paper_trade(self, user_id: str, signal: Dict): Execute paper trade (virtual execution)

---
