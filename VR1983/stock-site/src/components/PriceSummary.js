import React from 'react';

const PriceSummary = ({ opens, highs, lows, closes }) => (
  <div className="flex flex-wrap gap-4 mb-4">
    <div className="bg-gray-800 rounded-lg p-3 min-w-[120px]">
      <div className="text-gray-400 text-sm">Open</div>
      <div className="text-white font-semibold">
        ₹{opens[opens.length - 1]?.toFixed(2) || "0.00"}
      </div>
    </div>
    <div className="bg-gray-800 rounded-lg p-3 min-w-[120px]">
      <div className="text-gray-400 text-sm">High</div>
      <div className="text-green-400 font-semibold">
        ₹{Math.max(...highs)?.toFixed(2) || "0.00"}
      </div>
    </div>
    <div className="bg-gray-800 rounded-lg p-3 min-w-[120px]">
      <div className="text-gray-400 text-sm">Low</div>
      <div className="text-red-400 font-semibold">
        ₹{Math.min(...lows)?.toFixed(2) || "0.00"}
      </div>
    </div>
    <div className="bg-gray-800 rounded-lg p-3 min-w-[120px]">
      <div className="text-gray-400 text-sm">Close</div>
      <div className={`font-semibold ${
        closes[closes.length - 1] >= opens[opens.length - 1]
          ? "text-green-400"
          : "text-red-400"
      }`}>
        ₹{closes[closes.length - 1]?.toFixed(2) || "0.00"}
      </div>
    </div>
  </div>
);

export default PriceSummary;