import React from 'react';

const PriceSummary = ({ opens, highs, lows, closes, primaryColor = "#42a5f5" }) => (
  <div className="flex flex-wrap gap-4 mb-4">
    <div 
      className="rounded-lg p-3 min-w-[120px] border"
      style={{ 
        backgroundColor: `${primaryColor}05`,
        borderColor: `${primaryColor}20`
      }}
    >
      <div className="text-sm" style={{ color: primaryColor }}>Open</div>
      <div className="font-semibold" style={{ color: primaryColor }}>
        ₹{opens[opens.length - 1]?.toFixed(2) || "0.00"}
      </div>
    </div>
    
    <div 
      className="rounded-lg p-3 min-w-[120px] border"
      style={{ 
        backgroundColor: `${primaryColor}05`,
        borderColor: `${primaryColor}20`
      }}
    >
      <div className="text-sm" style={{ color: primaryColor }}>High</div>
      <div className="font-semibold" style={{ color: '#16a34a' }}>
        ₹{Math.max(...highs)?.toFixed(2) || "0.00"}
      </div>
    </div>
    
    <div 
      className="rounded-lg p-3 min-w-[120px] border"
      style={{ 
        backgroundColor: `${primaryColor}05`,
        borderColor: `${primaryColor}20`
      }}
    >
      <div className="text-sm" style={{ color: primaryColor }}>Low</div>
      <div className="font-semibold" style={{ color: '#dc2626' }}>
        ₹{Math.min(...lows)?.toFixed(2) || "0.00"}
      </div>
    </div>
    
    <div 
      className="rounded-lg p-3 min-w-[120px] border"
      style={{ 
        backgroundColor: `${primaryColor}05`,
        borderColor: `${primaryColor}20`
      }}
    >
      <div className="text-sm" style={{ color: primaryColor }}>Close</div>
      <div className={`font-semibold ${
        closes[closes.length - 1] >= opens[opens.length - 1]
          ? "text-green-600"
          : "text-red-600"
      }`}>
        ₹{closes[closes.length - 1]?.toFixed(2) || "0.00"}
      </div>
    </div>
  </div>
);

export default PriceSummary;