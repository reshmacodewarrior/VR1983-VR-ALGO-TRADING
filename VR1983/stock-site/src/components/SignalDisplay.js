import React from "react";
import { Bell } from "lucide-react"; // ✅ horn icon

const SignalDisplay = ({
  currentSignal,
  executingOrder,
  holdSignal,
  buySignal,
  sellSignal,
  tradingMode,
  handleBuy,
  handleSell,
  autoTradeCount,
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
        <p>
          ⚡ {executingOrder.message} at ₹{executingOrder.price}
        </p>
      ) : holdSignal ? (
        <p className="flex items-center gap-2" style={{ color: primaryColor }}>
          <Bell size={18} /> HOLD Signal Active — No trades executed
        </p>
      ) : currentSignal ? (
        <p>
          🔔 Current Signal:{" "}
          <span
            className={
              currentSignal.signal === "BUY"
                ? "text-green-600"
                : currentSignal.signal === "SELL"
                ? "text-red-600"
                : `text-[${primaryColor}]`
            }
          >
            {currentSignal.signal}
          </span>
        </p>
      ) : (
        <p>No active signal</p>
      )}

      {tradingMode === "manual" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleBuy}
            className="px-3 py-1 rounded hover:scale-105 transition-all text-white font-medium"
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
            className="px-3 py-1 rounded hover:scale-105 transition-all text-white font-medium"
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

      {tradingMode === "auto" && (
        <p className="text-sm mt-2" style={{ color: `${primaryColor}80` }}>
          🤖 Auto trading active (Executed {autoTradeCount} trades)
        </p>
      )}
    </div>
  );
};

export default SignalDisplay;