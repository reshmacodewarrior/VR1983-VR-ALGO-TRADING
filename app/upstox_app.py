import streamlit as st
import requests
import json
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from decimal import Decimal

# Pydantic Models (copied from your API file)
class UpstoxTokenResponse(BaseModel):
    access_token: str
    token_type: Optional[str] = None
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None

class UpstoxUserProfile(BaseModel):
    user_id: str
    user_name: str
    email: str
    exchanges: list[str]
    products: list[str]
    broker: str
    order_types: list[str]
    user_type: str
    poa: bool
    is_active: bool

class UpstoxConnection(BaseModel):
    broker_name: str = "upstox"
    broker_user_id: str
    user_name: str
    email: str
    access_token: str
    refresh_token: Optional[str] = ""
    token_expiry: datetime
    created_at: datetime
    last_used: datetime
    is_active: bool = True
    profile_data: Dict[str, Any]

class ConnectionStatus(BaseModel):
    connected: bool
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    email: Optional[str] = None
    connected_since: Optional[datetime] = None

class DebugConfig(BaseModel):
    client_id: str
    redirect_uri: str
    has_client_id: bool
    has_client_secret: bool
    constructed_auth_url: str

class UpstoxOrder(BaseModel):
    quantity: int
    product: str = "D"
    validity: str = "DAY"
    price: float = 0
    tag: str = "string"
    instrument_token: str
    order_type: str
    transaction_type: str
    disclosed_quantity: int = 0
    trigger_price: float = 0
    is_amo: bool = False
    slice: bool = True

class UpstoxMultiOrder(BaseModel):
    correlation_id: str = Field(..., description="Unique identifier for each order in the batch")
    quantity: int
    product: str = "D"
    validity: str = "DAY"
    price: float = 0
    tag: str = "string"
    instrument_token: str
    order_type: str
    transaction_type: str
    disclosed_quantity: int = 0
    trigger_price: float = 0
    is_amo: bool = False
    slice: bool = False

class MultiOrderRequest(BaseModel):
    orders: List[UpstoxMultiOrder] = Field(..., min_items=1, max_items=10, description="List of orders to place (max 10 orders)")

class MultiOrderResponse(BaseModel):
    success: bool
    message: str
    data: List[dict]
    failed_orders: List[dict] = []

# Streamlit Application
class UpstoxStreamlitApp:
    def __init__(self):
        self.base_url = "https://api.upstox.com/v2"
        self.init_session_state()
    
    def init_session_state(self):
        """Initialize session state variables"""
        if 'access_token' not in st.session_state:
            st.session_state.access_token = None
        if 'user_profile' not in st.session_state:
            st.session_state.user_profile = None
        if 'connection_status' not in st.session_state:
            st.session_state.connection_status = None
        if 'orders' not in st.session_state:
            st.session_state.orders = []
        if 'client_id' not in st.session_state:
            st.session_state.client_id = ""
        if 'client_secret' not in st.session_state:
            st.session_state.client_secret = ""
        if 'redirect_uri' not in st.session_state:
            st.session_state.redirect_uri = ""

    def get_auth_url(self):
        """Generate Upstox authorization URL"""
        if not st.session_state.client_id:
            st.error("Please enter Client ID first")
            return None
        
        auth_url = (
            f"https://api.upstox.com/v2/login/authorization/dialog"
            f"?response_type=code"
            f"&client_id={st.session_state.client_id}"
            f"&redirect_uri={st.session_state.redirect_uri}"
        )
        return auth_url

    def exchange_code_for_token(self, authorization_code: str):
        """Exchange authorization code for access token"""
        try:
            token_url = "https://api.upstox.com/v2/login/authorization/token"
            
            payload = {
                "code": authorization_code,
                "client_id": st.session_state.client_id,
                "client_secret": st.session_state.client_secret,
                "redirect_uri": st.session_state.redirect_uri,
                "grant_type": "authorization_code"
            }
            
            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            }
            
            response = requests.post(token_url, data=payload, headers=headers)
            
            if response.status_code == 200:
                token_data = response.json()
                token_response = UpstoxTokenResponse(**token_data)
                st.session_state.access_token = token_response.access_token
                st.session_state.refresh_token = token_response.refresh_token
                return token_response
            else:
                st.error(f"Token exchange failed: {response.text}")
                return None
                
        except Exception as e:
            st.error(f"Error exchanging code for token: {str(e)}")
            return None

    def get_user_profile(self):
        """Get user profile using access token"""
        if not st.session_state.access_token:
            st.error("No access token available")
            return None
        
        try:
            headers = {
                "Authorization": f"Bearer {st.session_state.access_token}",
                "Accept": "application/json"
            }
            
            response = requests.get(f"{self.base_url}/user/profile", headers=headers)
            
            if response.status_code == 200:
                profile_data = response.json()
                user_profile = UpstoxUserProfile(**profile_data['data'])
                st.session_state.user_profile = user_profile
                return user_profile
            else:
                st.error(f"Failed to get user profile: {response.text}")
                return None
                
        except Exception as e:
            st.error(f"Error getting user profile: {str(e)}")
            return None

    def get_connection_status(self):
        """Get current connection status"""
        if st.session_state.access_token and st.session_state.user_profile:
            connection_status = ConnectionStatus(
                connected=True,
                user_id=st.session_state.user_profile.user_id,
                user_name=st.session_state.user_profile.user_name,
                email=st.session_state.user_profile.email,
                connected_since=datetime.now()
            )
        else:
            connection_status = ConnectionStatus(connected=False)
        
        st.session_state.connection_status = connection_status
        return connection_status

    def place_single_order(self, order: UpstoxOrder):
        """Place a single order"""
        if not st.session_state.access_token:
            st.error("Not connected to Upstox")
            return None
        
        try:
            headers = {
                "Authorization": f"Bearer {st.session_state.access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/order/place",
                data=order.json(),
                headers=headers
            )
            
            return response.json()
            
        except Exception as e:
            st.error(f"Error placing order: {str(e)}")
            return None

    def place_multiple_orders(self, multi_order_request: MultiOrderRequest):
        """Place multiple orders in batch"""
        if not st.session_state.access_token:
            st.error("Not connected to Upstox")
            return None
        
        try:
            headers = {
                "Authorization": f"Bearer {st.session_state.access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/order/place/multileg",
                data=multi_order_request.json(),
                headers=headers
            )
            
            return response.json()
            
        except Exception as e:
            st.error(f"Error placing multiple orders: {str(e)}")
            return None

    def render_sidebar(self):
        """Render the sidebar with connection controls"""
        st.sidebar.title("🔗 Upstox Connection")
        
        # API Configuration
        st.sidebar.subheader("API Configuration")
        st.session_state.client_id = st.sidebar.text_input(
            "Client ID",
            value=st.session_state.client_id,
            type="password"
        )
        st.session_state.client_secret = st.sidebar.text_input(
            "Client Secret",
            value=st.session_state.client_secret,
            type="password"
        )
        st.session_state.redirect_uri = st.sidebar.text_input(
            "Redirect URI",
            value=st.session_state.redirect_uri or "http://localhost:8501"
        )
        
        # Authorization
        st.sidebar.subheader("Authorization")
        
        if st.session_state.client_id:
            auth_url = self.get_auth_url()
            if auth_url:
                st.sidebar.markdown(f"[Login with Upstox]({auth_url})")
        
        authorization_code = st.sidebar.text_input("Authorization Code", type="password")
        
        if st.sidebar.button("Connect") and authorization_code:
            with st.spinner("Connecting to Upstox..."):
                token_response = self.exchange_code_for_token(authorization_code)
                if token_response:
                    user_profile = self.get_user_profile()
                    if user_profile:
                        st.sidebar.success(f"Connected as {user_profile.user_name}")
        
        # Disconnect button
        if st.session_state.access_token:
            if st.sidebar.button("Disconnect"):
                st.session_state.access_token = None
                st.session_state.user_profile = None
                st.session_state.connection_status = None
                st.sidebar.success("Disconnected successfully")
        
        # Connection Status
        st.sidebar.subheader("Connection Status")
        connection_status = self.get_connection_status()
        
        if connection_status.connected:
            st.sidebar.success("✅ Connected")
            st.sidebar.write(f"User: {connection_status.user_name}")
            st.sidebar.write(f"ID: {connection_status.user_id}")
        else:
            st.sidebar.error("❌ Not Connected")

    def render_dashboard(self):
        """Render the main dashboard"""
        st.title("📈 Upstox Trading Platform")
        
        if not st.session_state.access_token:
            st.warning("Please connect to Upstox using the sidebar to access trading features")
            return
        
        # User Profile Section
        st.header("User Profile")
        if st.session_state.user_profile:
            profile = st.session_state.user_profile
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("User ID", profile.user_id)
                st.metric("User Name", profile.user_name)
            
            with col2:
                st.metric("Email", profile.email)
                st.metric("Broker", profile.broker)
            
            with col3:
                st.metric("User Type", profile.user_type)
                st.metric("POA", "Yes" if profile.poa else "No")
            
            # Exchanges and Products
            col4, col5 = st.columns(2)
            with col4:
                st.write("**Exchanges:**")
                for exchange in profile.exchanges:
                    st.write(f"- {exchange}")
            
            with col5:
                st.write("**Products:**")
                for product in profile.products:
                    st.write(f"- {product}")

    def render_single_order_form(self):
        """Render single order placement form"""
        st.header("📤 Place Single Order")
        
        with st.form("single_order_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                instrument_token = st.text_input("Instrument Token", value="")
                quantity = st.number_input("Quantity", min_value=1, value=1)
                price = st.number_input("Price", min_value=0.0, value=0.0, step=0.05)
                trigger_price = st.number_input("Trigger Price", min_value=0.0, value=0.0, step=0.05)
            
            with col2:
                order_type = st.selectbox(
                    "Order Type",
                    ["MARKET", "LIMIT", "SL", "SL-M"]
                )
                transaction_type = st.selectbox(
                    "Transaction Type",
                    ["BUY", "SELL"]
                )
                product = st.selectbox(
                    "Product",
                    ["D", "I", "CO", "BO", "MIS", "CNC"]
                )
                validity = st.selectbox(
                    "Validity",
                    ["DAY", "IOC"]
                )
            
            disclosed_quantity = st.number_input("Disclosed Quantity", min_value=0, value=0)
            
            if st.form_submit_button("Place Order"):
                if not instrument_token:
                    st.error("Instrument Token is required")
                    return
                
                order = UpstoxOrder(
                    quantity=quantity,
                    product=product,
                    validity=validity,
                    price=price,
                    tag="streamlit_app",
                    instrument_token=instrument_token,
                    order_type=order_type,
                    transaction_type=transaction_type,
                    disclosed_quantity=disclosed_quantity,
                    trigger_price=trigger_price
                )
                
                result = self.place_single_order(order)
                if result:
                    st.success("Order placed successfully!")
                    st.json(result)

    def render_multiple_orders_form(self):
        """Render multiple orders placement form"""
        st.header("📦 Place Multiple Orders")
        
        st.info("You can place up to 10 orders in a single batch")
        
        num_orders = st.number_input("Number of Orders", min_value=1, max_value=10, value=1)
        
        orders = []
        for i in range(num_orders):
            st.subheader(f"Order {i+1}")
            
            col1, col2 = st.columns(2)
            
            with col1:
                correlation_id = st.text_input(f"Correlation ID {i+1}", value=f"order_{i+1}")
                instrument_token = st.text_input(f"Instrument Token {i+1}", value="")
                quantity = st.number_input(f"Quantity {i+1}", min_value=1, value=1, key=f"qty_{i}")
                price = st.number_input(f"Price {i+1}", min_value=0.0, value=0.0, step=0.05, key=f"price_{i}")
            
            with col2:
                order_type = st.selectbox(
                    f"Order Type {i+1}",
                    ["MARKET", "LIMIT", "SL", "SL-M"],
                    key=f"type_{i}"
                )
                transaction_type = st.selectbox(
                    f"Transaction Type {i+1}",
                    ["BUY", "SELL"],
                    key=f"trans_{i}"
                )
                product = st.selectbox(
                    f"Product {i+1}",
                    ["D", "I", "CO", "BO", "MIS", "CNC"],
                    key=f"prod_{i}"
                )
            
            trigger_price = st.number_input(f"Trigger Price {i+1}", min_value=0.0, value=0.0, step=0.05, key=f"trigger_{i}")
            
            if instrument_token:
                order = UpstoxMultiOrder(
                    correlation_id=correlation_id,
                    quantity=quantity,
                    product=product,
                    validity="DAY",
                    price=price,
                    tag="streamlit_batch",
                    instrument_token=instrument_token,
                    order_type=order_type,
                    transaction_type=transaction_type,
                    trigger_price=trigger_price
                )
                orders.append(order)
        
        if st.button("Place Multiple Orders") and orders:
            multi_order_request = MultiOrderRequest(orders=orders)
            
            result = self.place_multiple_orders(multi_order_request)
            if result:
                st.success("Multiple orders placed successfully!")
                st.json(result)

    def render_order_history(self):
        """Render order history section"""
        st.header("📋 Order History")
        
        # This would typically fetch from Upstox API
        # For demo purposes, we'll show session orders
        if st.session_state.orders:
            orders_df = pd.DataFrame([order.dict() for order in st.session_state.orders])
            st.dataframe(orders_df)
        else:
            st.info("No orders placed in this session")

    def render_debug_info(self):
        """Render debug information"""
        if st.sidebar.checkbox("Show Debug Info"):
            st.sidebar.subheader("Debug Information")
            
            debug_config = DebugConfig(
                client_id=st.session_state.client_id,
                redirect_uri=st.session_state.redirect_uri,
                has_client_id=bool(st.session_state.client_id),
                has_client_secret=bool(st.session_state.client_secret),
                constructed_auth_url=self.get_auth_url() or "Not available"
            )
            
            st.sidebar.json(debug_config.dict())

    def run(self):
        """Main application runner"""
        self.render_sidebar()
        self.render_dashboard()
        
        if st.session_state.access_token:
            # Create tabs for different functionalities
            tab1, tab2, tab3, tab4 = st.tabs([
                "Single Order", 
                "Multiple Orders", 
                "Order History", 
                "Account Info"
            ])
            
            with tab1:
                self.render_single_order_form()
            
            with tab2:
                self.render_multiple_orders_form()
            
            with tab3:
                self.render_order_history()
            
            with tab4:
                st.header("Account Information")
                if st.session_state.user_profile:
                    st.json(st.session_state.user_profile.dict())
        
        self.render_debug_info()

# Run the application
if __name__ == "__main__":
    app = UpstoxStreamlitApp()
    app.run()