import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import TradingModeToggle from "./TradingModeToggle";
import SignalDisplay from "./SignalDisplay";
import ChartControls from "./ChartControls";
import PriceSummary from "./PriceSummary";
import Celebration from "./Celebration";
import { placeOrder } from "../services/api";
import { loadExcelData, getStockLevels } from "../services/excelService";

const CandlestickChart = ({ data, symbol }) => {
  const [chartType, setChartType] = useState("candlestick");
  const [quantity, setQuantity] = useState(1);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [celebrate, setCelebrate] = useState(""); 
  const [tradingMode, setTradingMode] = useState("manual");
  const [executingOrder, setExecutingOrder] = useState(null);
  
  // New states for Excel data and levels
  const [excelData, setExcelData] = useState([]);
  const [triggerLevels, setTriggerLevels] = useState([]);
  const [triggeredLevels, setTriggeredLevels] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");

  const primaryColor = "#42a5f5";

  // Load Excel file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await loadExcelData(file);
      setExcelData(data);
      
      // Extract unique stocks for dropdown
      const uniqueStocks = [...new Set(data.map(item => item.symbol))];
      console.log("Loaded stocks:", uniqueStocks);
      
    } catch (error) {
      console.error("Error loading Excel file:", error);
      alert("Error loading Excel file. Please check the format.");
    }
  };

  // Update trigger levels when stock selection changes
  useEffect(() => {
    if (selectedStock && excelData.length > 0) {
      const levels = getStockLevels(excelData, selectedStock);
      setTriggerLevels(levels);
      console.log(`Set trigger levels for ${selectedStock}:`, levels);
    } else {
      setTriggerLevels([]);
    }
  }, [selectedStock, excelData]);

  // Check for level triggers in real-time
  useEffect(() => {
    if (!data?.length || triggerLevels.length === 0) return;

    const latestPrice = data[data.length - 1].Close || data[data.length - 1].close;
    const newTriggered = [];

    triggerLevels.forEach(level => {
      // Check if price is within 0.1% of the trigger level
      const threshold = level * 0.001; // 0.1% threshold
      if (Math.abs(latestPrice - level) <= threshold) {
        if (!triggeredLevels.includes(level)) {
          newTriggered.push(level);
          // Show notification
          setCelebrate(`🎯 Price triggered! ${selectedStock} reached ₹${level}`);
        }
      }
    });

    if (newTriggered.length > 0) {
      setTriggeredLevels(prev => [...prev, ...newTriggered]);
    }
  }, [data, triggerLevels, selectedStock, triggeredLevels]);

  // Manual Orders (keep your existing functions)
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
      console.log(`✅ Sold ${quantity} shares of ${symbol} at ₹${latest.close}`);
    } catch (err) {
      console.error("Sell order error:", err);
    }
  };

  const recordTransaction = (orderData, type, mode, result, fallbackPrice) => {
    const executedPrice = result?.executed_price ?? orderData?.average_price ?? fallbackPrice ?? 0;

    const newTransaction = {
      type,
      price: executedPrice,
      time: result?.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      symbol,
      orderData: {
        ...orderData,
        executed_at: result?.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        executed_price: executedPrice,
      },
      mode,
    };

    setTransactionHistory((prev) => [...prev, newTransaction]);
    setCelebrate(
      `✅ ${mode.toUpperCase()} ${type} executed: ${orderData.quantity} Qty ${symbol} @ ₹${executedPrice}`
    );
  };

  // Prepare chart data with trigger levels
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600 rounded-xl shadow-lg p-6 border"
        style={{
          backgroundColor: 'white',
          borderColor: `${primaryColor}20`
        }}>
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

  // Create traces for trigger levels
  const levelTraces = triggerLevels.map((level, index) => {
    const isTriggered = triggeredLevels.includes(level);
    
    return {
      x: [dates[0], dates[dates.length - 1]],
      y: [level, level],
      type: 'scatter',
      mode: 'lines',
      name: `Level: ₹${level}`,
      line: {
        color: isTriggered ? '#ff4444' : '#6666ff',
        width: 2,
        dash: 'dash'
      }
    };
  });

  // Create traces for triggered points
  const triggerPointTraces = triggeredLevels.map((level, index) => {
    const latestDate = dates[dates.length - 1];
    return {
      x: [latestDate],
      y: [level],
      type: 'scatter',
      mode: 'markers',
      name: `Triggered: ₹${level}`,
      marker: {
        color: '#ff4444',
        size: 12,
        symbol: 'star'
      },
      showlegend: false
    };
  });

  const allTraces = [priceTrace, ...levelTraces, ...triggerPointTraces];

  return (
    <div className="w-full shadow-lg rounded-xl p-4 border"
      style={{
        backgroundColor: 'white',
        borderColor: `${primaryColor}20`
      }}>
      <Celebration trigger={celebrate} />
      
      {/* Excel File Upload */}
      <div className="mb-4 p-3 rounded-lg border" style={{ 
        backgroundColor: `${primaryColor}05`,
        borderColor: `${primaryColor}20`
      }}>
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          Upload Excel File with Stock Levels
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="w-full px-3 py-2 border rounded-md text-sm"
          style={{
            borderColor: `${primaryColor}40`,
            backgroundColor: 'white'
          }}
        />
        
        {/* Stock Selection Dropdown */}
        {excelData.length > 0 && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
              Select Stock to Plot Levels
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{
                borderColor: `${primaryColor}40`,
                backgroundColor: 'white',
                color: '#1f2937'
              }}
            >
              <option value="">Select a stock</option>
              {[...new Set(excelData.map(item => item.symbol))].map(symbol => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <TradingModeToggle
        symbol={symbol}
        tradingMode={tradingMode}
        setTradingMode={setTradingMode}
      />

      {/* Quantity Selector */}
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
          }}
        />
      </div>

      <SignalDisplay
        executingOrder={executingOrder}
        tradingMode={tradingMode}
        handleBuy={handleBuy}
        handleSell={handleSell}
        triggerLevels={triggerLevels}
        triggeredLevels={triggeredLevels}
        selectedStock={selectedStock}
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

      {/* Trigger Levels Info */}
      {triggerLevels.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border" style={{ 
          backgroundColor: `${primaryColor}05`,
          borderColor: `${primaryColor}20`
        }}>
          <h4 className="font-medium mb-2" style={{ color: primaryColor }}>
            📊 Trigger Levels for {selectedStock}
          </h4>
          <div className="flex flex-wrap gap-2">
            {triggerLevels.map(level => (
              <span
                key={level}
                className={`px-2 py-1 rounded text-sm ${
                  triggeredLevels.includes(level) 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                ₹{level} {triggeredLevels.includes(level) && '🎯'}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${primaryColor}20` }}>
        <Plot
          data={allTraces}
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
            showlegend: true,
            legend: {
              x: 0,
              y: 1.1,
              orientation: 'h'
            }
          }}
          style={{ width: "100%", height: "500px" }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
};

export default CandlestickChart;