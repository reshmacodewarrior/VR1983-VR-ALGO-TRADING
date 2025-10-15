// src/services/strategyApi.js
import axios from 'axios';

const API_BASE = 'http://192.168.1.58:8000/api/strategy';

// Add token to requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const strategyApi = {
  // Strategy Management
  getStrategies: () => 
    axios.get(`${API_BASE}/list`, { headers: getAuthHeaders() }),

  getStrategy: (id) => 
    axios.get(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),

  createStrategy: (strategyData) => 
    axios.post(`${API_BASE}/create`, strategyData, { headers: getAuthHeaders() }),

  updateStrategy: (id, strategyData) => 
    axios.put(`${API_BASE}/${id}`, strategyData, { headers: getAuthHeaders() }),

  deleteStrategy: (id) => 
    axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),

  // Backtesting
  runBacktest: (backtestData) => 
    axios.post(`${API_BASE}/backtest`, backtestData, { headers: getAuthHeaders() }),

  getBacktestResults: (backtestId) => 
    axios.get(`${API_BASE}/backtest/${backtestId}`, { headers: getAuthHeaders() }),

  // Marketplace
  publishStrategy: (strategyId) => 
    axios.post(`${API_BASE}/publish`, { strategy_id: strategyId }, { headers: getAuthHeaders() }),

  getMarketplace: () => 
    axios.get(`${API_BASE}/marketplace`, { headers: getAuthHeaders() }),
};

// Named exports for easier imports
export const {
  getStrategies,
  getStrategy, 
  createStrategy,
  updateStrategy,
  deleteStrategy,
  runBacktest,
  getBacktestResults,
  publishStrategy,
  getMarketplace
} = strategyApi;