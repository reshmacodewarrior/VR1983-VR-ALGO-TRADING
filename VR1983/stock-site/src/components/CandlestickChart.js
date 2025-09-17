import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";

const CandlestickChart = ({ data, symbol }) => {
  const [chartType, setChartType] = useState("candlestick");
  const [buySignal, setBuySignal] = useState(null);
  const [sellSignal, setSellSignal] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [tradingMode, setTradingMode] = useState("manual");
  const [autoTrades, setAutoTrades] = useState([]);
  const [currentSignal, setCurrentSignal] = useState(null);
  const [holdSignal, setHoldSignal] = useState(null);
  const [executingOrder, setExecutingOrder] = useState(null);

  const API_BASE_URL = "http://192.168.1.58:8000";

  // Function to place order in database
  const placeOrder = async (orderData) => {
    console.log("Placing order:", orderData);
    console.log("API URL:", `${API_BASE_URL}/api/order`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const result = await response.json();
      console.log("Order placed successfully:", result);
      return result;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  };

  // Execute automatic buy
  const executeAutoBuy = async (signal) => {
    if (!data || data.length === 0) return;

    const latestData = data[data.length - 1];

    // Show executing message for 1 second
    setExecutingOrder({
      type: "BUY",
      price: latestData.close,
      symbol: symbol,
      message: "Auto-executing BUY order..."
    });

    // Wait for 1 second before placing the order
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create order data structure
    const orderData = {
      order_id: `AUTO_BUY_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol: symbol,
      exchange: "NSE",
      transaction_type: "BUY",
      quantity: 1,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latestData.close,
    };

    try {
      // Place order in database
      const result = await placeOrder(orderData);

      const newTransaction = {
        type: "BUY",
        price: latestData.close,
        time: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        symbol: symbol,
        orderData: { ...orderData, executed_at: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
        mode: "auto",
        signal: currentSignal?.type || "Automatic BUY"
      };

      setTransactionHistory((prev) => [...prev, newTransaction]);
      setAutoTrades((prev) => [
        ...prev,
        {
          type: "BUY",
          level: signal.level,
          time: signal.time,
        },
      ]);

      // Clear executing message
      setExecutingOrder(null);
      
      console.log(`Auto BUY executed at ${latestData.close}`);
    } catch (error) {
      console.error("Auto buy order error:", error);
      setExecutingOrder(null);
    }
  };

  // Execute automatic sell
  const executeAutoSell = async (signal) => {
    if (!data || data.length === 0) return;

    const latestData = data[data.length - 1];

    // Show executing message for 1 second
    setExecutingOrder({
      type: "SELL",
      price: latestData.close,
      symbol: symbol,
      message: "Auto-executing SELL order..."
    });

    // Wait for 1 second before placing the order
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create order data structure
    const orderData = {
      order_id: `AUTO_SELL_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol: symbol,
      exchange: "NSE",
      transaction_type: "SELL",
      quantity: 1,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latestData.close,
    };

    try {
      // Place order in database
      const result = await placeOrder(orderData);

      const newTransaction = {
        type: "SELL",
        price: latestData.close,
        time: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        symbol: symbol,
        orderData: { ...orderData, executed_at: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
        mode: "auto",
        signal: currentSignal?.type || "Automatic SELL"
      };

      setTransactionHistory((prev) => [...prev, newTransaction]);
      setAutoTrades((prev) => [
        ...prev,
        {
          type: "SELL",
          level: signal.level,
          time: signal.time,
        },
      ]);

      // Clear executing message
      setExecutingOrder(null);
      
      console.log(`Auto SELL executed at ${latestData.close}`);
    } catch (error) {
      console.error("Auto sell order error:", error);
      setExecutingOrder(null);
    }
  };

  // Handle automatic trading based on signals
  const handleAutoTrading = useCallback(async (signal) => {
    if (!data || data.length === 0) return;

    const latestData = data[data.length - 1];
    const currentPrice = latestData.close;
    
    // Get current Indian time
    const nowIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const currentTime = new Date(nowIST);

    // Check if we already executed this trade to avoid duplicates
    const tradeExists = autoTrades.some(
      (trade) =>
        trade.type === signal.signal &&
        trade.time.getTime() === currentTime.getTime()
    );

    if (tradeExists) return;

    if (signal.signal === "BUY") {
      const newSignal = {
        level: signal.price || currentPrice,
        price: currentPrice,
        time: currentTime,
        message: `BUY signal: ${signal.type || "Automatic BUY signal"}`,
      };
      setBuySignal(newSignal);
      executeAutoBuy(newSignal);
    } 
    else if (signal.signal === "SELL") {
      const newSignal = {
        level: signal.price || currentPrice,
        price: currentPrice,
        time: currentTime,
        message: `SELL signal: ${signal.type || "Automatic SELL signal"}`,
      };
      setSellSignal(newSignal);
      executeAutoSell(newSignal);
    }
    else if (signal.signal === "HOLD") {
      const newSignal = {
        level: signal.price || currentPrice,
        price: currentPrice,
        time: currentTime,
        message: `HOLD signal: ${signal.type || "No action needed"}`
      };
      setHoldSignal(newSignal);
      console.log(`HOLD signal for ${symbol}: ${signal.type || "No action needed"}`);
    }
  }, [data, autoTrades, symbol, currentSignal, executeAutoBuy, executeAutoSell]);

  // Fetch signals from API
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        console.log("Fetching signals...");
        const response = await fetch(`${API_BASE_URL}/api/signals`);
        if (!response.ok) {
          throw new Error("Failed to fetch signals");
        }
        const signalsData = await response.json();
        
        // Find the current symbol's signal
        const symbolSignal = signalsData.signals.find(s => s.symbol === symbol.replace(".NS", ".MS"));
        if (symbolSignal) {
          setCurrentSignal(symbolSignal);
          
          // Auto-execute orders if in auto mode
          if (tradingMode === "auto") {
            handleAutoTrading(symbolSignal);
          }
        }
      } catch (error) {
        console.error("Error fetching signals:", error);
      }
    };

    fetchSignals();
    // Set up interval to refresh signals periodically (every minute)
    const intervalId = setInterval(fetchSignals, 300000);

    return () => clearInterval(intervalId);
  }, [symbol, tradingMode, handleAutoTrading]);

  const handleBuy = async () => {
    if (!data || data.length === 0) return;

    const latestData = data[data.length - 1];
    console.log("Latest Data on Buy:", latestData);

    const orderData = {
      order_id: `MANUAL_BUY_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol,
      exchange: "NSE",
      transaction_type: "BUY",
      quantity: 1,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latestData.close,
    };

    try {
      // Place order in database
      const result = await placeOrder(orderData);

      const newTransaction = {
        type: "BUY",
        price: latestData.close,
        time: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        symbol: symbol,
        orderData: { ...orderData, executed_at: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
        mode: "manual",
      };

      setTransactionHistory((prev) => [...prev, newTransaction]);
      setBuySignal(null);

      alert(
        `Successfully bought 1 share of ${symbol} at ₹${latestData.close}\nOrder ID: ${orderData.order_id}`
      );
    } catch (error) {
      alert("Failed to place buy order. Please try again.");
      console.error("Buy order error:", error);
    }
  };

  const handleSell = async () => {
    if (!data || data.length === 0) return;

    const latestData = data[data.length - 1];

    const orderData = {
      order_id: `MANUAL_SELL_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol,
      exchange: "NSE",
      transaction_type: "SELL",
      quantity: 1,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latestData.close,
    };

    try {
      // Place order in database
      const result = await placeOrder(orderData);

      const newTransaction = {
        type: "SELL",
        price: latestData.close,
        time: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        symbol: symbol,
        orderData: { ...orderData, executed_at: result.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) },
        mode: "manual",
      };

      setTransactionHistory((prev) => [...prev, newTransaction]);
      setSellSignal(null);

      alert(
        `Successfully sold 1 share of ${symbol} at ₹${latestData.close}\nOrder ID: ${orderData.order_id}`
      );
    } catch (error) {
      alert("Failed to place sell order. Please try again.");
      console.error("Sell order error:", error);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-900 to-blue-900 text-gray-300 rounded-xl shadow-2xl p-6">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No chart data available</h3>
        <p className="text-blue-300">Select a different symbol or timeframe</p>
      </div>
    );
  }

  // Prepare data for Plotly
  const dates = data.map((item) => new Date(item.date));
  const opens = data.map((item) => item.open);
  const highs = data.map((item) => item.high);
  const lows = data.map((item) => item.low);
  const closes = data.map((item) => item.close);

  // Create chart traces based on chart type
  let priceTrace;
  if (chartType === "candlestick") {
    priceTrace = {
      x: dates,
      open: opens,
      high: highs,
      low: lows,
      close: closes,
      type: "candlestick",
      name: "Price",
      increasing: { line: { color: "#10b981" }, fillcolor: "#10b981" },
      decreasing: { line: { color: "#ef4444" }, fillcolor: "#ef4444" },
      yaxis: "y1",
    };
  } else {
    priceTrace = {
      x: dates,
      y: closes,
      type: "scatter",
      mode: "lines",
      name: "Price",
      line: { color: "#3b82f6", width: 2 },
      yaxis: "y1",
    };
  }

  // Create signal level traces if we have a current signal with price
  const signalTraces = [];
  if (currentSignal && currentSignal.price > 0) {
    const signalColor = currentSignal.signal === "BUY" ? "#10b981" : 
                       currentSignal.signal === "SELL" ? "#ef4444" : "#f59e0b";
    
    signalTraces.push({
      x: dates,
      y: Array(dates.length).fill(currentSignal.price),
      type: "scatter",
      mode: "lines",
      name: `${currentSignal.signal} ${currentSignal.price}`,
      line: {
        color: signalColor,
        width: 2,
        dash: "dash",
      },
      yaxis: "y1",
    });
  }

  // Final chart data
  const chartData = [
    ...signalTraces,
    priceTrace,
  ].filter((trace) => trace !== null);

  const layout = {
    title: {
      text: `${symbol} Chart${currentSignal ? ` - ${currentSignal.signal} Signal` : ''}`,
      font: { color: "#e5e7eb", size: 20 },
      x: 0.05,
      xanchor: "left",
    },
    height: 600,
    showlegend: true,
    xaxis: {
      rangeslider: { visible: false },
      title: { text: "Date", font: { color: "#9ca3af" } },
      gridcolor: "#374151",
      tickfont: { color: "#9ca3af" },
    },
    yaxis: {
      title: { text: "Price (INR)", font: { color: "#9ca3af" } },
      tickformat: "₹.2f",
      gridcolor: "#374151",
      tickfont: { color: "#9ca3af" },
    },
    margin: { l: 60, r: 60, t: 80, b: 60 },
    plot_bgcolor: "#1f2937",
    paper_bgcolor: "#111827",
    font: { family: "Inter, sans-serif" },
    hovermode: "x unified",
  };
  
  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    modeBarButtonsToAdd: [
      "drawline",
      "drawopenpath",
      "drawclosedpath",
      "drawcircle",
      "drawrect",
      "eraseshape",
    ],
    toImageButtonOptions: {
      format: "png",
      filename: `${symbol}_chart`,
      height: 600,
      width: 1000,
      scale: 2,
    },
    modeBarButtons: [["zoom2d", "pan2d", "resetScale2d"], ["toImage"]],
  };

  const chartTypes = [
    { value: "candlestick", label: "Candlestick" },
    { value: "line", label: "Line" },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-blue-900 shadow-2xl rounded-xl p-4 border border-gray-700">
      {/* Trading Mode Toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{symbol} Trading</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium">
            Trading Mode:
          </span>
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

      {/* Mode Indicator */}
      <div
        className={`mb-4 p-3 rounded-lg text-center font-semibold ${
          tradingMode === "auto"
            ? "bg-yellow-900 text-yellow-200"
            : "bg-blue-900 text-blue-200"
        }`}
      >
        {tradingMode === "auto"
          ? "AUTOMATIC TRADING MODE: Orders will be executed automatically based on algorithm signals"
          : "MANUAL TRADING MODE: Click Buy/Sell buttons to execute orders manually"}
      </div>

      {/* Current Signal Display */}
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

      {/* Executing Order Message */}
      {executingOrder && (
        <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
          executingOrder.type === "BUY" ? "bg-blue-900 text-blue-200" :
          executingOrder.type === "SELL" ? "bg-blue-900 text-blue-200" :
          "bg-blue-900 text-blue-200"
        }`}>
          <strong>EXECUTING {executingOrder.type} ORDER:</strong> {executingOrder.message}
        </div>
      )}

      {/* Signal Alerts */}
      <div className="mb-4">
        {holdSignal && (
          <div className="bg-yellow-900 text-yellow-200 p-3 rounded-lg mb-2 flex justify-between items-center">
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

      {/* Chart Controls */}
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
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
            >
              Buy
            </button>
            <button
              onClick={handleSell}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            >
              Sell
            </button>
          </div>
        )}
      </div>

      {/* Price Summary */}
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
          <div
            className={`font-semibold ${
              closes[closes.length - 1] >= opens[opens.length - 1]
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            ₹{closes[closes.length - 1]?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <div className="mb-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">
            Recent Transactions
          </h3>
          <div className="bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
            {transactionHistory
              .slice()
              .reverse()
              .map((transaction, index) => (
                <div
                  key={index}
                  className={`text-sm ${
                    transaction.type === "BUY"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  [{transaction.mode.toUpperCase()}] {transaction.type}{" "}
                  {transaction.symbol} at ₹{transaction.price.toFixed(2)} -{" "}
                  {typeof transaction.time === 'string' 
                    ? transaction.time 
                    : new Date(transaction.time).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })
                  }
                  {transaction.signal && (
                    <span className="text-gray-400 text-xs"> - {transaction.signal}</span>
                  )}
                  <br />
                  <span className="text-gray-400 text-xs">
                    Order ID: {transaction.orderData.order_id}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="border border-gray-700 rounded-xl overflow-hidden">
        <Plot
          data={chartData}
          layout={layout}
          config={config}
          useResizeHandler={true}
          style={{ width: "100%", height: "600px" }}
          onInitialized={() => console.log("Chart initialized")}
          onUpdate={() => console.log("Chart updated")}
        />
      </div>
    </div>
  );
};

export default CandlestickChart;