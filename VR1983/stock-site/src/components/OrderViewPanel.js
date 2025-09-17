import React, { useState, useEffect } from "react";

const OrderViewPanel = ({ orderData, loading, error, onRefresh, onStockSelect }) => {
  const [selectedStock, setSelectedStock] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getPnlColor = (pnl) => {
    if (pnl > 0) return "text-green-400";
    if (pnl < 0) return "text-red-400";
    return "text-gray-400";
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    if (onStockSelect) {
      onStockSelect(stock);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 mt-4">
        <h3 className="text-lg font-semibold text-white mb-4">Order View</h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 mt-4">
        <h3 className="text-lg font-semibold text-white mb-4">Order View</h3>
        <div className="text-red-400 p-4 text-center">
          Error loading order data: {error}
          <button
            onClick={onRefresh}
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Order View</h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
        >
          Refresh
        </button>
      </div>

      {orderData.length === 0 ? (
        <div className="text-gray-400 p-4 text-center">
          No orders found. Start trading to see your order history.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {orderData.map((order) => (
                <tr 
                  key={order.no} 
                  className={`hover:bg-gray-750 ${selectedStock?.symbol === order.symbol ? 'bg-gray-750' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {order.no}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-400">
                    {order.symbol}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {formatCurrency(order.order_price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {formatCurrency(order.current_price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {order.quantity}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getPnlColor(
                      order.profit_loss
                    )}`}
                  >
                    {formatCurrency(order.profit_loss)}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getRiskLevelColor(
                      order.risk_level
                    )}`}
                  >
                    {order.risk_level}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => handleStockSelect(order)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderViewPanel;