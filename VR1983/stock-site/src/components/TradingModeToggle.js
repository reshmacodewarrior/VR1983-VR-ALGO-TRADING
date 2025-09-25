import React from 'react';

const TradingModeToggle = ({ symbol, tradingMode, setTradingMode }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-white">{symbol} Trading</h2>
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm font-medium">Trading Mode:</span>
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            tradingMode === "manual"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
          onClick={() => setTradingMode("manual")}
        >
          Manual
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            tradingMode === "auto"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
          onClick={() => setTradingMode("auto")}
        >
          Auto
        </button>
      </div>
    </div>
  </div>
);

export default TradingModeToggle;