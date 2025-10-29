# tests/test_market.py
import pytest
from fastapi.testclient import TestClient
from api.routes import api_router

client = TestClient(api_router)


def test_get_stock_data():
    response = client.get("/api/market/stock/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert "current_price" in data
    assert data["symbol"] == "AAPL"


def test_get_bulk_data_us_stocks():
    response = client.get("/api/market/bulk/US%20Stocks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "AAPL" in data or "MSFT" in data  # at least one stock present


def test_get_categories():
    response = client.get("/api/market/categories")
    assert response.status_code == 200
    categories = response.json()
    assert "US Stocks" in categories
    assert "Indian Stocks" in categories


def test_get_indian_stocks():
    response = client.get("/api/market/indian-stocks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "RELIANCE.NS" in data or "TCS.NS" in data


def test_process_search_queue():
    symbols = ["AAPL", "MSFT", "BTC-USD"]
    response = client.post("/api/market/search-queue", json=symbols)
    assert response.status_code == 200
    data = response.json()
    for symbol in symbols:
        assert symbol in data


def test_get_historical_data():
    response = client.get("/api/market/historical/AAPL?period=1mo&interval=1d")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "date" in data[0]
    assert "close" in data[0]
