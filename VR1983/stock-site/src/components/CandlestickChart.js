import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import TradingModeToggle from "./TradingModeToggle";
import SignalDisplay from "./SignalDisplay";
import ChartControls from "./ChartControls";
import PriceSummary from "./PriceSummary";
import Celebration from "./Celebration";
import { placeOrder, fetchSignals } from "../services/api";

const CandlestickChart = ({ data, symbol }) => {
  const [chartType, setChartType] = useState("candlestick");
  const [quantity, setQuantity] = useState(1);
  const [buySignal, setBuySignal] = useState(null);
  const [sellSignal, setSellSignal] = useState(null);
  const [holdSignal, setHoldSignal] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [autoTrades, setAutoTrades] = useState([]);
  const [celebrate, setCelebrate] = useState(""); 
  const [tradingMode, setTradingMode] = useState("manual");
  const [currentSignal, setCurrentSignal] = useState(null);
  const [executingOrder, setExecutingOrder] = useState(null);

  // Primary color for the theme
  const primaryColor = "#42a5f5";

  // ✅ Track executed auto-trades by stock + signal time
  const [autoTradeTracker, setAutoTradeTracker] = useState({});

  // -------------------------------
  // Helpers
  // -------------------------------

  // -------------------------------
  // Manual Orders
  // -------------------------------
  const handleBuy = async () => {
    if (!data?.length) return;
    const latest = data[data.length - 1];

    const orderData = {
      order_id: `MANUAL_BUY_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol,
      exchange: "NSE",
      transaction_type: "BUY",
      quantity,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latest.close,
    };

    try {
      const result = await placeOrder(orderData);
      recordTransaction(orderData, "BUY", "manual", result, latest.close);
      setBuySignal(null);
      console.log(`✅ Bought ${quantity} shares of ${symbol} at ₹${latest.close}`);
    } catch (err) {
      console.error("Buy order error:", err);
    }
  };

  const handleSell = async () => {
    if (!data?.length) return;
    const latest = data[data.length - 1];

    const orderData = {
      order_id: `MANUAL_SELL_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol,
      exchange: "NSE",
      transaction_type: "SELL",
      quantity,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latest.close,
    };

    try {
      const result = await placeOrder(orderData);
      recordTransaction(orderData, "SELL", "manual", result, latest.close);
      setSellSignal(null);
      console.log(`✅ Sold ${quantity} shares of ${symbol} at ₹${latest.close}`);
    } catch (err) {
      console.error("Sell order error:", err);
    }
  };

  // -------------------------------
  // Auto Trading
  // -------------------------------
  const executeAutoOrder = useCallback(
    async (type, signal) => {
      if (!data?.length) return;

      // ✅ Ensure only one trade per symbol per signal-time
      const signalKey = `${symbol}_${signal.signal}_${signal.time}`;
      if (autoTradeTracker[signalKey]) {
        console.warn(`🚫 Already executed auto ${type} for ${symbol} at ${signal.time}`);
        return;
      }

      const latest = data[data.length - 1];
      setExecutingOrder({
        type,
        price: latest.close,
        symbol,
        message: `Auto-executing ${type} order...`,
      });

      await new Promise((res) => setTimeout(res, 500));

      const orderData = {
        order_id: `AUTO_${type}_${Date.now()}`,
        user_id: "68b17a50dba7d93a5ac110e7",
        symbol,
        exchange: "NSE",
        transaction_type: type,
        quantity,
        order_type: "MARKET",
        product: "MIS",
        status: "COMPLETE",
        average_price: latest.close,
      };

      try {
        const result = await placeOrder(orderData);
        recordTransaction(orderData, type, "auto", result, latest.close);

        setAutoTrades((prev) => [
          ...prev,
          { type, level: signal.level, time: signal.time },
        ]);

        // ✅ Mark this signal as executed
        setAutoTradeTracker((prev) => ({
          ...prev,
          [signalKey]: true,
        }));
      } catch (error) {
        console.error(`Auto ${type} order error:`, error);
      } finally {
        setExecutingOrder(null);
      }
    },
    [data, symbol, quantity, autoTradeTracker]
  );

  const recordTransaction = (orderData, type, mode, result, fallbackPrice) => {
    // ✅ Use backend-executed price if available
    const executedPrice =
      result?.executed_price ??   // backend price
      orderData?.average_price ?? // manual/fallback
      orderData?.price ??
      orderData?.order_price ??
      fallbackPrice ??
      0;

    const newTransaction = {
      type,
      price: executedPrice,
      time:
        result?.timestamp ||
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      symbol,
      orderData: {
        ...orderData,
        executed_at:
          result?.timestamp ||
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        executed_price: executedPrice, // ✅ store exact backend price
      },
      mode,
    };

    setTransactionHistory((prev) => [...prev, newTransaction]);
    setCelebrate(
      `✅ ${mode.toUpperCase()} ${type} executed: ${orderData.quantity} Qty ${symbol} @ ₹${executedPrice}`
    );
  };

  // -------------------------------
  // Signal Fetch
  // -------------------------------
  useEffect(() => {
    const loadSignals = async () => {
      try {
        const signalsData = await fetchSignals();
        if (!signalsData?.signals) return;

        const match = signalsData.signals.find(
          (s) =>
            s.symbol?.toLowerCase() === symbol.toLowerCase() ||
            s.symbol?.toUpperCase() === symbol.toUpperCase()
        );

        if (match) {
          setCurrentSignal(match);

          if (tradingMode === "auto") {
            if (match.signal === "BUY") executeAutoOrder("BUY", match);
            if (match.signal === "SELL") executeAutoOrder("SELL", match);
            if (match.signal === "HOLD") setHoldSignal(match);
          }
        } else {
          setCurrentSignal(null);
        }
      } catch (err) {
        console.error("Error fetching signals:", err);
      }
    };

    loadSignals();
    const intervalId = setInterval(loadSignals, 1800000);
    return () => clearInterval(intervalId);
  }, [symbol, tradingMode, executeAutoOrder]);

  // -------------------------------
  // Render
  // -------------------------------
  if (!data?.length) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-96 text-gray-600 rounded-xl shadow-lg p-6 border"
        style={{
          backgroundColor: 'white',
          borderColor: `${primaryColor}20`
        }}
      >
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No chart data available</h3>
        <p style={{ color: primaryColor }}>Select a different symbol or timeframe</p>
      </div>
    );
  }

  const dates = data.map((d) => new Date(d.date));
  const opens = data.map((d) => d.Open ?? d.open);
  const highs = data.map((d) => d.High ?? d.high);
  const lows = data.map((d) => d.Low ?? d.low);
  const closes = data.map((d) => d.Close ?? d.close);

  const priceTrace =
    chartType === "candlestick"
      ? {
          x: dates,
          open: opens,
          high: highs,
          low: lows,
          close: closes,
          type: "candlestick",
          name: symbol,
          increasing: { line: { color: "green" }, fillcolor: "green" },
          decreasing: { line: { color: "red" }, fillcolor: "red" },
        }
      : {
          x: dates,
          y: closes,
          type: "scatter",
          mode: "lines",
          line: { color: "deepgreen", width: 2 },
          name: symbol,
        };

  return (
    <div 
      className="w-full shadow-lg rounded-xl p-4 border"
      style={{
        backgroundColor: 'white',
        borderColor: `${primaryColor}20`
      }}
    >
      <Celebration trigger={celebrate} />   {/* 🎉 popup here */}
      <TradingModeToggle
        symbol={symbol}
        tradingMode={tradingMode}
        setTradingMode={setTradingMode}
      />

      {/* ✅ Quantity Selector */}
      <div className="flex items-center gap-2 mb-4">
        <label style={{ color: primaryColor }}>Qty:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-20 px-2 py-1 rounded border transition-colors"
          style={{
            backgroundColor: 'white',
            color: '#1f2937',
            borderColor: `${primaryColor}40`,
            focusBorderColor: primaryColor
          }}
        />
      </div>

      <SignalDisplay
        currentSignal={currentSignal}
        executingOrder={executingOrder}
        holdSignal={holdSignal}
        buySignal={buySignal}
        sellSignal={sellSignal}
        tradingMode={tradingMode}
        handleBuy={handleBuy}
        handleSell={handleSell}
        autoTradeCount={Object.keys(autoTradeTracker).length} // ✅ count signals executed
      />

      <ChartControls
        chartType={chartType}
        setChartType={setChartType}
        chartTypes={[
          { value: "candlestick", label: "Candlestick" },
          { value: "line", label: "Line" },
        ]}
        tradingMode={tradingMode}
        handleBuy={handleBuy}
        handleSell={handleSell}
      />

      <PriceSummary opens={opens} highs={highs} lows={lows} closes={closes} />

      <div 
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <Plot
          data={[priceTrace]}
          layout={{
            dragmode: "zoom",
            margin: { t: 25, r: 25, b: 40, l: 60 },
            paper_bgcolor: "white",
            plot_bgcolor: "white",
            font: { color: "#374151" },
            xaxis: { 
              type: "date", 
              rangeslider: { visible: false },
              gridcolor: `${primaryColor}10`,
              linecolor: `${primaryColor}30`
            },
            yaxis: { 
              autorange: true,
              gridcolor: `${primaryColor}10`,
              linecolor: `${primaryColor}30`
            },
          }}
          style={{ width: "100%", height: "500px" }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
};

export default CandlestickChart;