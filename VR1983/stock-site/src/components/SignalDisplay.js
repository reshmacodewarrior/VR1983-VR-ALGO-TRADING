import React from 'react';

const SignalDisplay = ({ 
  currentSignal, 
  tradingMode, 
  executingOrder, 
  holdSignal, 
  buySignal, 
  sellSignal, 
  handleBuy, 
  handleSell 
}) => (
  <>
    <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
      tradingMode === "auto"
        ? "bg-yellow-900 text-yellow-200"
        : "bg-blue-900 text-blue-200"
    }`}>
      {tradingMode === "auto"
        ? "AUTOMATIC TRADING MODE: Orders will be executed automatically based on algorithm signals"
        : "MANUAL TRADING MODE: Click Buy/Sell buttons to execute orders manually"}
    </div>

    {currentSignal && (
      <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
        currentSignal.signal === "BUY" ? "bg-green-900 text-green-200" :
        currentSignal.signal === "SELL" ? "bg-red-900 text-red-200" :
        "bg-yellow-900 text-yellow-200"
      }`}>
        <strong>ALGORITHM SIGNAL:</strong> {currentSignal.signal} - {currentSignal.type}
        {currentSignal.price > 0 && ` at ₹${currentSignal.price}`}
        {tradingMode === "auto" && currentSignal.signal !== "HOLD" && 
          " (Will be executed automatically)"}
      </div>
    )}

    {executingOrder && (
      <div className="mb-4 p-3 rounded-lg text-center font-semibold bg-blue-900 text-blue-200">
        <strong>EXECUTING {executingOrder.type} ORDER:</strong> {executingOrder.message}
      </div>
    )}

    <div className="mb-4">
      {holdSignal && (
        <div className="bg-yellow-900 text-yellow-200 p-3 rounded-lg mb-2">
          <strong>HOLD SIGNAL:</strong> {holdSignal.message}
        </div>
      )}
      
      {buySignal && (
        <div className="bg-green-900 text-green-200 p-3 rounded-lg mb-2 flex justify-between items-center">
          <div>
            <strong>BUY SIGNAL EXECUTED</strong>: {buySignal.message}
            {tradingMode === "auto" && (
              <span className="ml-2 text-yellow-300">(Auto-executed)</span>
            )}
          </div>
          {tradingMode === "manual" && (
            <button
              onClick={handleBuy}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Buy 1 Stock
            </button>
          )}
        </div>
      )}

      {sellSignal && (
        <div className="bg-red-900 text-red-200 p-3 rounded-lg mb-2 flex justify-between items-center">
          <div>
            <strong>SELL SIGNAL EXECUTED</strong>: {sellSignal.message}
            {tradingMode === "auto" && (
              <span className="ml-2 text-yellow-300">(Auto-executed)</span>
            )}
          </div>
          {tradingMode === "manual" && (
            <button
              onClick={handleSell}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Sell 1 Stock
            </button>
          )}
        </div>
      )}
    </div>
  </>
);

export default SignalDisplay;