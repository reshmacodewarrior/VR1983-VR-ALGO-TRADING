import React from "react";

const SignalDisplay = ({
  executingOrder,
  tradingMode,
  handleBuy,
  handleSell,
  triggerLevels,
  triggeredLevels,
  selectedStock,
  primaryColor = "#42a5f5"
}) => {
  return (
    <div 
      className="mb-4 p-3 rounded-lg border"
      style={{ 
        backgroundColor: `${primaryColor}05`,
        borderColor: `${primaryColor}20`,
        color: primaryColor
      }}
    >
      {executingOrder ? (
        <p className="flex items-center gap-2">
          <span className="animate-pulse">⚡</span>
          {executingOrder.message} at ₹{executingOrder.price}
        </p>
      ) : triggeredLevels.length > 0 ? (
        <div className="bg-red-50 p-2 rounded border border-red-200">
          <p className="text-red-600 font-medium flex items-center gap-2">
            <span>🎯</span>
            PRICE TRIGGER ALERT!
          </p>
          <p className="text-sm text-red-700 mt-1">
            {selectedStock} triggered {triggeredLevels.length} level(s): 
            <strong> {triggeredLevels.map(level => `₹${level}`).join(', ')}</strong>
          </p>
          <p className="text-xs text-red-600 mt-1">
            This price level is triggering now!
          </p>
        </div>
      ) : triggerLevels.length > 0 ? (
        <p className="flex items-center gap-2">
          <span>📊</span>
          Monitoring {triggerLevels.length} level(s) for {selectedStock}
        </p>
      ) : selectedStock ? (
        <p className="text-gray-600">
          No levels found for {selectedStock}
        </p>
      ) : (
        <p>Upload Excel file and select a stock to monitor levels</p>
      )}

      {tradingMode === "manual" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleBuy}
            className="px-4 py-2 rounded hover:scale-105 transition-all text-white font-medium shadow-sm"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1e88e5';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = primaryColor;
            }}
          >
            BUY
          </button>
          <button
            onClick={handleSell}
            className="px-4 py-2 rounded hover:scale-105 transition-all text-white font-medium shadow-sm"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1e88e5';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = primaryColor;
            }}
          >
            SELL
          </button>
        </div>
      )}

      {tradingMode === "auto" && triggerLevels.length > 0 && (
        <p className="text-sm mt-2 text-green-600">
          🤖 Auto trading active - Monitoring {triggerLevels.length} level(s)
        </p>
      )}
    </div>
  );
};

export default SignalDisplay;