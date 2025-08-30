# test_stock_api.py
import requests
import json
import asyncio
import pytest
from datetime import datetime

# Base URL for the API
BASE_URL = "http://192.168.1.58:8000"  # Update if running on different port

def test_root_endpoint():
    """Test the root endpoint"""
    response = requests.get(f"{BASE_URL}/api")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["status"] == "healthy"
    print("✓ Root endpoint test passed")

def test_single_stock():
    """Test single stock endpoint"""
    response = requests.get(f"{BASE_URL}/api/stock/RELIANCE.NS")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE.NS"
    assert "current_price" in data
    print("✓ Single stock test passed")

def test_bulk_stocks():
    """Test bulk stocks endpoint"""
    symbols = "RELIANCE.NS,INFY.NS"
    response = requests.get(f"{BASE_URL}/api/stocks/bulk?symbols={symbols}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    print("✓ Bulk stocks test passed")

def test_indian_stocks():
    """Test Indian stocks endpoint"""
    response = requests.get(f"{BASE_URL}/api/stocks/indian?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 5
    print("✓ Indian stocks test passed")

def test_search_stocks():
    """Test search endpoint"""
    response = requests.get(f"{BASE_URL}/api/search?query=reliance")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    print("✓ Search stocks test passed")

def test_categories():
    """Test categories endpoint"""
    response = requests.get(f"{BASE_URL}/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert "indian_stocks" in data
    print("✓ Categories test passed")

def test_valid_intervals():
    """Test valid intervals endpoint"""
    response = requests.get(f"{BASE_URL}/api/valid-intervals/1d")
    assert response.status_code == 200
    data = response.json()
    assert "valid_intervals" in data
    print("✓ Valid intervals test passed")

def test_category_stocks():
    """Test category stocks endpoint"""
    response = requests.get(f"{BASE_URL}/api/stocks/category/indian_stocks?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 3
    print("✓ Category stocks test passed")

if __name__ == "__main__":
    print("Starting API tests...")
    
    # Run tests
    test_root_endpoint()
    test_single_stock()
    test_bulk_stocks()
    test_indian_stocks()
    test_search_stocks()
    test_categories()
    test_valid_intervals()
    test_category_stocks()
    
    print("\nAll tests completed! 🎉")