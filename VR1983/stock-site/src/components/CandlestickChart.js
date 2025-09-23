import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import TradingModeToggle from "./TradingModeToggle";
import SignalDisplay from "./SignalDisplay";
import ChartControls from "./ChartControls";
import PriceSummary from "./PriceSummary";
import TransactionHistory from "./TransactionHistory";
import { placeOrder, fetchSignals } from "../services/api";

const CandlestickChart = ({ data, symbol }) => {
  const [chartType, setChartType] = useState("candlestick");
  const [quantity, setQuantity] = useState(1);
  const [buySignal, setBuySignal] = useState(null);
  const [sellSignal, setSellSignal] = useState(null);
  const [holdSignal, setHoldSignal] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [autoTrades, setAutoTrades] = useState([]);
  const [tradingMode, setTradingMode] = useState("manual");
  const [currentSignal, setCurrentSignal] = useState(null);
  const [executingOrder, setExecutingOrder] = useState(null);
  const [autoTradeCount, setAutoTradeCount] = useState(0); // ✅ auto trade limiter

  // -------------------------------
  // Helpers
  // -------------------------------
  const recordTransaction = (orderData, type, mode, result) => {
    const executedPrice =
      orderData?.average_price ??
      orderData?.price ??
      orderData?.order_price ??
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
      },
      mode,
    };

    setTransactionHistory((prev) => [...prev, newTransaction]);
  };

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
      recordTransaction(orderData, "BUY", "manual", result);
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
      recordTransaction(orderData, "SELL", "manual", result);
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

      if (autoTradeCount >= 6) {
        console.warn("🚫 Auto trade limit reached (6). No more auto trades.");
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
        recordTransaction(orderData, type, "auto", result);
        setAutoTrades((prev) => [
          ...prev,
          { type, level: signal.level, time: signal.time },
        ]);
        setAutoTradeCount((prev) => prev + 1); // ✅ count increment
      } catch (error) {
        console.error(`Auto ${type} order error:`, error);
      } finally {
        setExecutingOrder(null);
      }
    },
    [data, symbol, quantity, autoTradeCount]
  );

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
            if (match.signal === "HOLD") setHoldSignal(match); // ✅ show horn icon
          }
        } else {
          setCurrentSignal(null);
        }
      } catch (err) {
        console.error("Error fetching signals:", err);
      }
    };

    loadSignals();
    const intervalId = setInterval(loadSignals, 30000);
    return () => clearInterval(intervalId);
  }, [symbol, tradingMode, executeAutoOrder]);

  // -------------------------------
  // Render
  // -------------------------------
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-900 to-blue-900 text-gray-300 rounded-xl shadow-2xl p-6">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No chart data available</h3>
        <p className="text-blue-300">Select a different symbol or timeframe</p>
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
    <div className="w-full bg-gradient-to-br from-gray-900 to-blue-900 shadow-2xl rounded-xl p-4 border border-gray-700">
      <TradingModeToggle
        symbol={symbol}
        tradingMode={tradingMode}
        setTradingMode={setTradingMode}
      />

      {/* ✅ Quantity Selector */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-gray-300">Qty:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-20 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <SignalDisplay
        currentSignal={currentSignal}
        executingOrder={executingOrder}
        holdSignal={holdSignal} // ✅ pass down hold signal
        buySignal={buySignal}
        sellSignal={sellSignal}
        tradingMode={tradingMode}
        handleBuy={handleBuy}
        handleSell={handleSell}
        autoTradeCount={autoTradeCount} // ✅ show count
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
      <TransactionHistory transactionHistory={transactionHistory} />

      <div className="border border-gray-700 rounded-xl overflow-hidden">
        <Plot
          data={[priceTrace]}
          layout={{
            dragmode: "zoom",
            margin: { t: 25, r: 25, b: 40, l: 60 },
            paper_bgcolor: "#0f172a",
            plot_bgcolor: "#0f172a",
            font: { color: "#f1f5f9" },
            xaxis: { type: "date", rangeslider: { visible: false } },
            yaxis: { autorange: true },
          }}
          style={{ width: "100%", height: "500px" }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
};

export default CandlestickChart;
