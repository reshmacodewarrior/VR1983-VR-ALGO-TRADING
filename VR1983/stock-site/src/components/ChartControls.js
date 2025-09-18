import React from 'react';

const ChartControls = ({ chartType, setChartType, chartTypes, tradingMode, handleBuy, handleSell }) => (
  <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm font-medium">Chart Type:</span>
      <div className="flex bg-gray-800 rounded-lg p-1">
        {chartTypes.map((type) => (
          <button
            key={type.value}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === type.value
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
            onClick={() => setChartType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>

    {tradingMode === "manual" && (
      <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-lg">
        <button
          onClick={handleBuy}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
        >
          Sell
        </button>
      </div>
    )}
  </div>
);

export default ChartControls;