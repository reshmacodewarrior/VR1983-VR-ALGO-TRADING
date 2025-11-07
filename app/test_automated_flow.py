import requests
import time
import json

BASE_URL = "https://localhost:8000"
# REPLACE THIS WITH YOUR NEW JWT TOKEN
JWT_TOKEN = "YOUR_NEW_JWT_TOKEN_HERE"  # Get this from login

headers = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Content-Type": "application/json"
}

def test_complete_flow():
    print("🚀 Testing Complete Automated Trading Flow...")
    
    # Test authentication first
    print("🔐 Testing authentication...")
    try:
        response = requests.get(f"{BASE_URL}/api/automated-trading/strategies", 
                              headers=headers, verify=False)
        if response.status_code == 200:
            print("✅ Authentication successful!")
        else:
            print(f"❌ Authentication failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return
    print("🚀 Testing Complete Automated Trading Flow...")
    
    # 1. Create strategies
    print("📊 Creating trading strategies...")
    response = requests.post(f"{BASE_URL}/api/automated-trading/create-default-strategies", 
                           headers=headers, verify=False)
    print(f"Strategies: {response.json()}")
    
    # 2. Start automated trading
    print("🤖 Starting automated trading...")
    response = requests.post(f"{BASE_URL}/api/automated-trading/start", 
                           headers=headers, verify=False)
    print(f"Start: {response.json()}")
    
    # 3. Force test (generate signals + place orders)
    print("🎯 Generating signals and placing orders...")
    response = requests.post(f"{BASE_URL}/api/automated-trading/force-test", 
                           headers=headers, verify=False)
    print(f"Force test: {response.json()}")
    
    # 4. Wait for processing
    print("⏳ Waiting for order processing...")
    time.sleep(3)
    
    # 5. Check results
    print("📈 Checking results...")
    
    # Check signals
    response = requests.get(f"{BASE_URL}/api/automated-trading/signals", 
                          headers=headers, verify=False)
    signals = response.json()
    print(f"📊 Signals generated: {len(signals.get('signals', []))}")
    
    # Check orders
    response = requests.get(f"{BASE_URL}/api/automated-trading/orders", 
                          headers=headers, verify=False)
    orders = response.json()
    print(f"📦 Orders placed: {len(orders.get('orders', []))}")
    
    # Show details
    for order in orders.get('orders', [])[:5]:  # Show first 5 orders
        print(f"  - Order: {order.get('symbol', 'Unknown')} | "
              f"Status: {order.get('status', 'Unknown')} | "
              f"Type: {order.get('order_type', 'Unknown')}")
    
    print("✅ Flow test completed!")

if __name__ == "__main__":
    test_complete_flow()