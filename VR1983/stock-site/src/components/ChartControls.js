import React from 'react';

const ChartControls = ({ chartType, setChartType, chartTypes, tradingMode, handleBuy, handleSell, primaryColor = "#42a5f5" }) => (
  <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium" style={{ color: primaryColor }}>Chart Type:</span>
      <div className="flex rounded-lg p-1" style={{ backgroundColor: `${primaryColor}10` }}>
        {chartTypes.map((type) => (
          <button
            key={type.value}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === type.value
                ? "text-white"
                : `hover:text-white hover:bg-[${primaryColor}30]`
            }`}
            style={{
              backgroundColor: chartType === type.value ? primaryColor : 'transparent',
              color: chartType === type.value ? 'white' : primaryColor,
            }}
            onClick={() => setChartType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>

    {tradingMode === "manual" && (
      <div className="flex items-center gap-3 p-2 rounded-xl border shadow-lg" style={{ borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}05` }}>
        <button
          onClick={handleBuy}
          className="px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1e88e5';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = primaryColor;
          }}
        >
          Buy
        </button>
        <button
          onClick={handleSell}
          className="px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1e88e5';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = primaryColor;
          }}
        >
          Sell
        </button>
      </div>
    )}
  </div>
);

export default ChartControls;