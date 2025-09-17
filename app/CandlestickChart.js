import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const CandlestickChart = ({ data, symbol }) => {
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candlestick");
  const [indicators, setIndicators] = useState([]);
  const [buySignal, setBuySignal] = useState(null);
  const [sellSignal, setSellSignal] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [tradingMode, setTradingMode] = useState("manual");
  const [autoTrades, setAutoTrades] = useState([]);

  // Define buy and sell levels
  const buyLevels = [706, 668];
  const sellLevels = [703, 667];

  const API_BASE_URL = "http://192.168.1.58:8000";

  useEffect(() => {
    if (!data || data.length === 0) return;

    const latestData = data[data.length - 1];
    const currentPrice = latestData.close;
    
    // Get current Indian time
    const nowIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const currentTime = new Date(nowIST);

    // Check if price crossed any buy levels
    for (const level of buyLevels) {
      if (currentPrice >= level) {
        const newSignal = {
          level,
          price: currentPrice,
          time: currentTime,
          message: `BUY signal: Price ${currentPrice} crossed above ${level}`,
        };
        setBuySignal(newSignal);
        
        // Execute automatic buy if in auto mode
        if (tradingMode === "auto") {
          executeAutoBuy(newSignal);
        }
        break;
      }
    }

    // Check if price crossed any sell levels
    for (const level of sellLevels) {
      if (currentPrice <= level) {
        const newSignal = {
          level,
          price: currentPrice,
          time: currentTime,
          message: `SELL signal: Price ${currentPrice} crossed below ${level}`,
        };
        setSellSignal(newSignal);
        
        // Execute automatic sell if in auto mode
        if (tradingMode === "auto") {
          executeAutoSell(newSignal);
        }
        break;
      }
    }
  }, [data, tradingMode]);

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

    // Check if we already executed this trade to avoid duplicates
    const tradeExists = autoTrades.some(
      (trade) =>
        trade.type === "BUY" &&
        trade.level === signal.level &&
        trade.time.getTime() === signal.time.getTime()
    );

    if (tradeExists) return;

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

      console.log(`Auto BUY executed at ${latestData.close}`);
    } catch (error) {
      console.error("Auto buy order error:", error);
    }
  };

  // Execute automatic sell
  const executeAutoSell = async (signal) => {
    if (!data || data.length === 0) return;

    const latestData = data[data.length - 1];

    // Check if we already executed this trade to avoid duplicates
    const tradeExists = autoTrades.some(
      (trade) =>
        trade.type === "SELL" &&
        trade.level === signal.level &&
        trade.time.getTime() === signal.time.getTime()
    );

    if (tradeExists) return;

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

      console.log(`Auto SELL executed at ${latestData.close}`);
    } catch (error) {
      console.error("Auto sell order error:", error);
    }
  };

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
  const volumes = data.map((item) => item.volume);

  // Calculate simple moving average (SMA) for 20 periods
  const calculateSMA = (data, period) => {
    return data.map((val, idx, arr) => {
      if (idx < period - 1) return null;
      return (
        arr
          .slice(idx - period + 1, idx + 1)
          .reduce((sum, val) => sum + val, 0) / period
      );
    });
  };

  const sma20 = calculateSMA(closes, 20);

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

  // Create volume trace
  const colors = closes.map((close, i) =>
    close >= opens[i] ? "#10b981" : "#ef4444"
  );

  const volumeTrace = {
    x: dates,
    y: volumes,
    type: "bar",
    name: "Volume",
    marker: { color: colors },
    opacity: 0.7,
    yaxis: "y2",
  };

  // Create SMA trace if selected
  const smaTrace = indicators.includes("sma")
    ? {
        x: dates,
        y: sma20,
        type: "scatter",
        mode: "lines",
        name: "SMA 20",
        line: { color: "#f59e0b", width: 2 },
        yaxis: "y1",
      }
    : null;

  // Create buy level traces (green lines)
  const buyTraces = buyLevels.map((level) => ({
    x: dates,
    y: Array(dates.length).fill(level),
    type: "scatter",
    mode: "lines",
    name: `Buy ${level}`,
    line: {
      color: "#10b981",
      width: 2,
      dash: "dash",
    },
    yaxis: "y1",
  }));

  // Create sell level traces (red lines)
  const sellTraces = sellLevels.map((level) => ({
    x: dates,
    y: Array(dates.length).fill(level),
    type: "scatter",
    mode: "lines",
    name: `Sell ${level}`,
    line: {
      color: "#ef4444",
      width: 2,
      dash: "dash",
    },
    yaxis: "y1",
  }));
  

  // Filter traces to remove any null values
  const chartData = [
    priceTrace,
    volumeTrace,
    smaTrace,
    ...buyTraces,
    ...sellTraces,
  ].filter((trace) => trace !== null);

  const layout = {
    title: {
      text: `${symbol} | Buy: ${buyLevels.join(", ")} | Sell: ${sellLevels.join(
        ", "
      )}`,
      font: { color: "#e5e7eb", size: 20 },
      x: 0.05,
      xanchor: "left",
    },
    height: 600,
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: "rgba(0,0,0,0.5)",
      font: { color: "#e5e7eb" },
      bordercolor: "#374151",
      borderwidth: 1,
    },
    xaxis: {
      rangeslider: { visible: false },
      title: { text: "Date", font: { color: "#9ca3af" } },
      gridcolor: "#374151",
      zerolinecolor: "#374151",
      tickfont: { color: "#9ca3af" },
    },
    yaxis: {
      title: { text: "Price (INR)", font: { color: "#9ca3af" } },
      domain: [0.25, 1],
      tickformat: "₹.2f",
      gridcolor: "#374151",
      zerolinecolor: "#374151",
      tickfont: { color: "#9ca3af" },
    },
    yaxis2: {
      title: { text: "Volume", font: { color: "#9ca3af" } },
      domain: [0, 0.2],
      side: "right",
      gridcolor: "#374151",
      zerolinecolor: "#374151",
      tickfont: { color: "#9ca3af" },
    },
    margin: { l: 60, r: 60, t: 80, b: 60 },
    plot_bgcolor: "#1f2937",
    paper_bgcolor: "#111827",
    font: { family: "Inter, sans-serif" },
    hovermode: "x unified",
    hoverlabel: {
      bgcolor: "#1f2937",
      font: { color: "#e5e7eb" },
      bordercolor: "#374151",
    },
    shapes: [
      // Add horizontal lines for buy levels
      ...buyLevels.map((level) => ({
        type: "line",
        x0: dates[0],
        y0: level,
        x1: dates[dates.length - 1],
        y1: level,
        line: {
          color: "#10b981",
          width: 2,
          dash: "dash",
        },
        yref: "y1",
      })),
      // Add horizontal lines for sell levels
      ...sellLevels.map((level) => ({
        type: "line",
        x0: dates[0],
        y0: level,
        x1: dates[dates.length - 1],
        y1: level,
        line: {
          color: "#ef4444",
          width: 2,
          dash: "dash",
        },
        yref: "y1",
      })),
    ],
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
  const availableIndicators = [{ value: "sma", label: "SMA 20" }];

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
          ? "AUTOMATIC TRADING MODE: Orders will be executed automatically when price crosses buy/sell levels"
          : "MANUAL TRADING MODE: Click Buy/Sell buttons to execute orders manually"}
      </div>

      {/* Signal Alerts */}
      <div className="mb-4">
        {buySignal && (
          <div className="bg-green-900 text-green-200 p-3 rounded-lg mb-2 flex justify-between items-center">
            <div>
              <strong>BUY SIGNAL</strong>: {buySignal.message}
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
              <strong>SELL SIGNAL</strong>: {sellSignal.message}
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

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium">Indicators:</span>
          <div className="flex bg-gray-800 rounded-lg p-1">
            {availableIndicators.map((indicator) => {
              const isActive = indicators.includes(indicator.value);
              return (
                <button
                  key={indicator.value}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    if (isActive) {
                      setIndicators(
                        indicators.filter((i) => i !== indicator.value)
                      );
                    } else {
                      setIndicators([...indicators, indicator.value]);
                    }
                  }}
                >
                  {indicator.label}
                </button>
              );
            })}
          </div>
        </div>
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
        <div className="bg-gray-800 rounded-lg p-3 min-w-[120px]">
          <div className="text-gray-400 text-sm">Volume</div>
          <div className="text-blue-400 font-semibold">
            {volumes[volumes.length - 1]
              ? (volumes[volumes.length - 1] / 1000000).toFixed(2) + "M"
              : "0"}
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