import React from 'react';

const SignalDisplay = ({ 
  executingOrder, 
  tradingMode, 
  handleBuy, 
  handleSell, 
  triggerLevels, 
  triggeredLevels, 
  selectedStock,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="mb-3">
        <h4 className="font-medium text-sm text-gray-700 mb-2">⚡ Quick Trade</h4>
        <div className="flex gap-2">
          <button
            onClick={handleBuy}
            disabled={executingOrder}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50"
          >
            BUY
          </button>
          <button
            onClick={handleSell}
            disabled={executingOrder}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            SELL
          </button>
        </div>
        {triggeredLevels.length > 0 && (
          <div className="mt-2 text-xs text-orange-600">
            🎯 {triggeredLevels.length} level(s) triggered
          </div>
        )}
      </div>
    );
  }

  // Your existing full version...
  
};

export default SignalDisplay;