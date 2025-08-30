import yfinance as yf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st
from datetime import datetime, timedelta
import time
import requests
from io import StringIO

# Set page configuration
st.set_page_config(
    page_title="Global Stock Dashboard - 1000+ Stocks",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="📈"
)

# Custom CSS for professional styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 1rem;
        font-weight: bold;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        padding: 15px;
        color: white;
        margin: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .stock-table {
        font-size: 0.9rem;
    }
    .positive-change {
        color: #2ecc71;
        font-weight: bold;
    }
    .negative-change {
        color: #e74c3c;
        font-weight: bold;
    }
    .search-queue {
        background-color: #e8f4f8;
        padding: 10px;
        border-radius: 8px;
        margin: 5px 0;
    }
</style>
""", unsafe_allow_html=True)

class GlobalStockDashboard:
    def __init__(self):
        self.indian_stocks = self.load_indian_stocks()
        self.us_stocks = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 
            'JPM', 'JNJ', 'V', 'WMT', 'DIS', 'NFLX', 'INTC', 'AMD',
            'BAC', 'XOM', 'PFE', 'CSCO', 'CMCSA', 'ADBE', 'PYPL', 'NFLX'
        ]
        self.crypto = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'ADA-USD', 'XRP-USD']
        self.forex = ['EURUSD=X', 'GBPUSD=X', 'JPYUSD=X', 'CNYUSD=X', 'INRUSD=X']
        self.indices = ['^GSPC', '^IXIC', '^DJI', '^NSEI', '^BSESN']
        
        self.all_symbols = self.us_stocks + self.crypto + self.forex + self.indices + list(self.indian_stocks.keys())
        
    def load_indian_stocks(self):
        """Load Indian stock symbols with their names"""
        indian_stocks = {
            'RELIANCE.NS': 'Reliance Industries',
            'TATAMOTORS.NS': 'Tata Motors',
            'INFY.NS': 'Infosys',
            'HDFCBANK.NS': 'HDFC Bank',
            'TCS.NS': 'Tata Consultancy Services',
            'ICICIBANK.NS': 'ICICI Bank',
            'HINDUNILVR.NS': 'Hindustan Unilever',
            'SBIN.NS': 'State Bank of India',
            'BAJFINANCE.NS': 'Bajaj Finance',
            'KOTAKBANK.NS': 'Kotak Mahindra Bank',
            'ITC.NS': 'ITC Limited',
            'LT.NS': 'Larsen & Toubro',
            'AXISBANK.NS': 'Axis Bank',
            'BHARTIARTL.NS': 'Bharti Airtel',
            'MARUTI.NS': 'Maruti Suzuki',
            'ASIANPAINT.NS': 'Asian Paints',
            'HINDALCO.NS': 'Hindalco Industries',
            'SUNPHARMA.NS': 'Sun Pharmaceutical',
            'TITAN.NS': 'Titan Company',
            'POWERGRID.NS': 'Power Grid Corporation',
            'NTPC.NS': 'NTPC Limited',
            'ONGC.NS': 'Oil & Natural Gas Corporation',
            'WIPRO.NS': 'Wipro',
            'ADANIPORTS.NS': 'Adani Ports',
            'ULTRACEMCO.NS': 'UltraTech Cement',
            'JSWSTEEL.NS': 'JSW Steel',
            'TECHM.NS': 'Tech Mahindra',
            'GRASIM.NS': 'Grasim Industries',
            'HCLTECH.NS': 'HCL Technologies',
            'DRREDDY.NS': 'Dr. Reddy\'s Laboratories',
            'INDUSINDBK.NS': 'IndusInd Bank',
            'CIPLA.NS': 'Cipla',
            'BAJAJFINSV.NS': 'Bajaj Finserv',
            'TATASTEEL.NS': 'Tata Steel',
            'HEROMOTOCO.NS': 'Hero MotoCorp',
            'COALINDIA.NS': 'Coal India',
            'BPCL.NS': 'Bharat Petroleum',
            'EICHERMOT.NS': 'Eicher Motors',
            'DIVISLAB.NS': 'Divi\'s Laboratories',
            'BRITANNIA.NS': 'Britannia Industries',
            'SBILIFE.NS': 'SBI Life Insurance',
            'HDFCLIFE.NS': 'HDFC Life Insurance',
            'UPL.NS': 'UPL Limited',
            'VEDL.NS': 'Vedanta Limited',
            'SHREECEM.NS': 'Shree Cement',
            'HINDPETRO.NS': 'Hindustan Petroleum',
            'IOC.NS': 'Indian Oil Corporation',
            'GAIL.NS': 'GAIL India',
            'M&M.NS': 'Mahindra & Mahindra'
        }
        return indian_stocks
    
    def fetch_stock_data(self, symbol, period="1d", interval="1d"):
        """Fetch stock data with error handling"""
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period, interval=interval)
            
            if hist.empty:
                return None
                
            info = stock.info
            prev_close = info.get('previousClose', hist['Close'].iloc[-2] if len(hist) > 1 else hist['Close'].iloc[-1])
            
            current_price = hist['Close'].iloc[-1]
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100
            
            stock_name = self.indian_stocks.get(symbol, info.get('longName', symbol))
            
            return {
                'history': hist,
                'current_price': current_price,
                'prev_close': prev_close,
                'change': change,
                'change_percent': change_percent,
                'high': hist['High'].max(),
                'low': hist['Low'].min(),
                'volume': hist['Volume'].sum(),
                'symbol': symbol,
                'name': stock_name,
                'currency': info.get('currency', 'USD'),
                'last_updated': datetime.now()
            }
        except Exception as e:
            return None
    
    def fetch_bulk_data(self, symbols, max_workers=10):
        """Fetch data for multiple symbols quickly"""
        results = {}
        for symbol in symbols:
            data = self.fetch_stock_data(symbol, period="1d", interval="1d")
            if data:
                results[symbol] = data
        return results
    
    def create_candlestick_chart(self, data, symbol):
        """Create professional candlestick chart"""
        fig = make_subplots(
            rows=2, cols=1,
            shared_xaxes=True,
            vertical_spacing=0.1,
            subplot_titles=(f'{symbol} Price', 'Volume'),
            row_width=[0.7, 0.3]
        )
        
        # Candlestick chart
        fig.add_trace(go.Candlestick(
            x=data.index,
            open=data['Open'],
            high=data['High'],
            low=data['Low'],
            close=data['Close'],
            name='Price',
            increasing_line_color='#2ecc71',
            decreasing_line_color='#e74c3c'
        ), row=1, col=1)
        
        # Volume bars
        colors = ['#2ecc71' if data['Close'].iloc[i] >= data['Open'].iloc[i] 
                 else '#e74c3c' for i in range(len(data))]
        
        fig.add_trace(go.Bar(
            x=data.index,
            y=data['Volume'],
            name='Volume',
            marker_color=colors,
            opacity=0.7
        ), row=2, col=1)
        
        # Update layout
        fig.update_layout(
            height=600,
            showlegend=False,
            xaxis_rangeslider_visible=False,
            template='plotly_white',
            margin=dict(l=50, r=50, t=80, b=50),
            title=f"{symbol} - Candlestick Chart"
        )
        
        fig.update_yaxes(title_text="Price", row=1, col=1)
        fig.update_yaxes(title_text="Volume", row=2, col=1)
        fig.update_xaxes(title_text="Date", row=2, col=1)
        
        return fig

def main():
    st.markdown('<h1 class="main-header">📊 Global Stock Dashboard - 1000+ Stocks</h1>', unsafe_allow_html=True)
    
    dashboard = GlobalStockDashboard()
    
    # Sidebar for navigation
    with st.sidebar:
        st.header("🌍 Navigation")
        
        view_option = st.radio(
            "Select View:",
            ["🔍 Single Stock Analysis", "📊 Bulk Stock Viewer", "🇮🇳 Indian Stocks", "⚡ Quick Search Queue"]
        )
        
        st.header("⏰ Time Settings")
        period = st.selectbox("Period:", ["1d", "5d", "1mo", "3mo", "6mo", "1y"], index=2)
        interval = st.selectbox("Interval:", ["1m", "5m", "15m", "30m", "1h", "1d"], index=5)
    
    # Single Stock Analysis
    if view_option == "🔍 Single Stock Analysis":
        col1, col2 = st.columns([2, 1])
        
        with col1:
            search_symbol = st.text_input("Enter symbol (e.g., RELIANCE.NS, AAPL, BTC-USD):", "RELIANCE.NS").upper()
        
        with col2:
            st.write("")
            st.write("")
            if st.button("Analyze Stock", type="primary"):
                st.session_state.current_symbol = search_symbol
        
        if 'current_symbol' in st.session_state:
            data = dashboard.fetch_stock_data(st.session_state.current_symbol, period, interval)
            if data:
                # Display metrics
                cols = st.columns(4)
                metrics = [
                    ("Current Price", f"${data['current_price']:.2f}"),
                    ("Change", f"{data['change']:.2f} ({data['change_percent']:.2f}%)"),
                    ("High", f"${data['high']:.2f}"),
                    ("Volume", f"{data['volume']:,}")
                ]
                
                for i, (label, value) in enumerate(metrics):
                    with cols[i]:
                        st.metric(label, value)
                
                # Chart
                fig = dashboard.create_candlestick_chart(data['history'], st.session_state.current_symbol)
                st.plotly_chart(fig, use_container_width=True)
                
                # Info
                st.write(f"**Company:** {data['name']}")
                st.write(f"**Currency:** {data['currency']}")
    
    # Bulk Stock Viewer
    elif view_option == "📊 Bulk Stock Viewer":
        st.header("📊 Bulk Stock Viewer - Top 50 Stocks")
        
        # Select category
        category = st.selectbox("Select Category:", 
                               ["US Stocks", "Indian Stocks", "Cryptocurrencies", "Forex", "Indices"])
        
        if category == "US Stocks":
            symbols = dashboard.us_stocks[:20]
        elif category == "Indian Stocks":
            symbols = list(dashboard.indian_stocks.keys())[:20]
        elif category == "Cryptocurrencies":
            symbols = dashboard.crypto
        elif category == "Forex":
            symbols = dashboard.forex
        else:
            symbols = dashboard.indices
        
        # Fetch bulk data
        if st.button("Load Bulk Data", type="primary"):
            with st.spinner("Loading stock data..."):
                bulk_data = dashboard.fetch_bulk_data(symbols)
                
                # Create DataFrame for display
                data_list = []
                for symbol, data in bulk_data.items():
                    data_list.append({
                        'Symbol': symbol,
                        'Name': data['name'],
                        'Price': data['current_price'],
                        'Change': data['change'],
                        'Change %': data['change_percent'],
                        'Volume': data['volume'],
                        'High': data['high'],
                        'Low': data['low']
                    })
                
                df = pd.DataFrame(data_list)
                df['Change Color'] = df['Change'].apply(lambda x: 'green' if x >= 0 else 'red')
                
                # Display table
                st.dataframe(
                    df.style.apply(lambda x: ['color: green' if x['Change'] >= 0 else 'color: red' for _ in x], axis=1),
                    use_container_width=True,
                    height=600
                )
    
    # Indian Stocks Section
    elif view_option == "🇮🇳 Indian Stocks":
        st.header("🇮🇳 Indian Stock Market")
        
        # Display Indian stocks in a nice layout
        cols = st.columns(4)
        indian_symbols = list(dashboard.indian_stocks.keys())
        
        for i, symbol in enumerate(indian_symbols[:20]):
            data = dashboard.fetch_stock_data(symbol, "1d", "1d")
            if data:
                with cols[i % 4]:
                    st.markdown(f"""
                    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                padding: 15px; border-radius: 10px; color: white; margin: 5px;'>
                        <div style='font-size: 1rem; font-weight: bold;'>{symbol}</div>
                        <div style='font-size: 1.2rem;'>₹{data['current_price']:.2f}</div>
                        <div style='color: {'#2ecc71' if data['change'] >= 0 else '#e74c3c'};'>
                            {data['change']:+.2f} ({data['change_percent']:+.2f}%)
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
    
    # Quick Search Queue
    elif view_option == "⚡ Quick Search Queue":
        st.header("⚡ Quick Search Queue")
        
        # Initialize session state for search queue
        if 'search_queue' not in st.session_state:
            st.session_state.search_queue = []
        
        # Add to queue
        col1, col2 = st.columns([3, 1])
        with col1:
            new_symbol = st.text_input("Add symbol to queue:").upper()
        with col2:
            st.write("")
            if st.button("Add to Queue") and new_symbol:
                if new_symbol not in st.session_state.search_queue:
                    st.session_state.search_queue.append(new_symbol)
        
        # Display queue
        if st.session_state.search_queue:
            st.write("**Current Queue:**")
            for i, symbol in enumerate(st.session_state.search_queue):
                col1, col2, col3 = st.columns([3, 1, 1])
                with col1:
                    st.write(f"{i+1}. {symbol}")
                with col2:
                    if st.button("Analyze", key=f"analyze_{i}"):
                        st.session_state.current_symbol = symbol
                with col3:
                    if st.button("Remove", key=f"remove_{i}"):
                        st.session_state.search_queue.pop(i)
                        st.rerun()
            
            # Analyze all button
            if st.button("Analyze All in Queue", type="primary"):
                results = []
                for symbol in st.session_state.search_queue:
                    data = dashboard.fetch_stock_data(symbol, "1d", "1d")
                    if data:
                        results.append({
                            'Symbol': symbol,
                            'Price': data['current_price'],
                            'Change': data['change'],
                            'Change %': data['change_percent'],
                            'Volume': data['volume']
                        })
                
                if results:
                    df = pd.DataFrame(results)
                    st.dataframe(
                        df.style.apply(lambda x: ['color: green' if x['Change'] >= 0 else 'color: red' for _ in x], axis=1),
                        use_container_width=True
                    )

    # Last updated
    st.markdown(f'<p style="text-align: right; color: #666; font-size: 0.9rem;">Last updated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>', 
               unsafe_allow_html=True)
    
    # Refresh button
    if st.button("🔄 Refresh All Data"):
        st.rerun()

if __name__ == "__main__":
    main()