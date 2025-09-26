import axios from "axios";

const API_BASE_URL = "http://192.168.1.58:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API calls matching your FastAPI endpoints
export const stockAPI = {
  // Get single stock data
  getStock: async (symbol, period = "1d", interval = "1d") => {
    try {
      const response = await api.get(`/api/market/stock/${symbol}`, {
        params: { period, interval },
      });
      console.log("response-1", response);

      return response.data;
    } catch (error) {
      console.error("Error fetching stock:", error);
      throw error;
    }
  },
  // Get bulk stocks data
  getBulkStocks: async (symbols, period = "1d", interval = "1d") => {
    try {
      const symbolsString = symbols.join(",");
      const response = await api.get("/api/stocks/bulk", {
        params: { symbols: symbolsString, period, interval },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching bulk stocks:", error);
      throw error;
    }
  },

  // Get Indian stocks
  getIndianStocks: async (limit = 50, period = "1d", interval = "1d") => {
    try {
      const response = await api.get("/api/stocks/indian", {
        params: { limit, period, interval },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Indian stocks:", error);
      throw error;
    }
  },

  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await api.get(`/api/search/${query}`);
      return response.data;
    } catch (error) {
      console.error("Error searching stocks:", error);
      throw error;
    }
  },
  
};



export const placeOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error("Failed to place order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

export const fetchSignals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signals`);
    if (!response.ok) {
      throw new Error("Failed to fetch signals");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching signals:", error);
    throw error;
  }
};

// In services/api.js

export const getWatchlist = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch watchlist");
    return await response.json();
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

export const addToWatchlist = async (symbol, exchange = "NSE") => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ symbol, exchange }), // Add exchange field
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to add to watchlist");
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

export const removeFromWatchlist = async (symbol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist/${symbol}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to remove from watchlist");
    }
    return await response.json();
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
};

// services/api.js
const BASE_URL = "http://192.168.1.58:8000";

export const watchlistAPI = {
  // Get user's watchlist
  getWatchlist: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/watchlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch watchlist");
    return response.json();
  },

  // Add symbol to watchlist
  addToWatchlist: async (symbol) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/watchlist`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol }),
    });
    if (!response.ok) throw new Error("Failed to add to watchlist");
    return response.json();
  },

  // Remove symbol from watchlist
  removeFromWatchlist: async (symbol) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/watchlist/${symbol}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to remove from watchlist");
    return response.json();
  },
};