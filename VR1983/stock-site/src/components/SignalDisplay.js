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
}) => {
  return (
    <div className="mb-4 p-3 rounded-lg bg-gray-800 text-gray-200">
      {executingOrder ? (
        <p>
          ⚡ {executingOrder.message} at ₹{executingOrder.price}
        </p>
      ) : holdSignal ? (
        <p className="flex items-center gap-2 text-yellow-400">
          <Bell size={18} /> HOLD Signal Active — No trades executed
        </p>
      ) : currentSignal ? (
        <p>
          🔔 Current Signal:{" "}
          <span
            className={
              currentSignal.signal === "BUY"
                ? "text-green-400"
                : currentSignal.signal === "SELL"
                ? "text-red-400"
                : "text-yellow-400"
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
            className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
          >
            BUY
          </button>
          <button
            onClick={handleSell}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            SELL
          </button>
        </div>
      )}

      {tradingMode === "auto" && (
        <p className="text-sm text-gray-400 mt-2">
           Auto trading active (Executed {autoTradeCount} trades)
        </p>
      )}
    </div>
  );
};

export default SignalDisplay;
