import React, { useState, useEffect, useCallback, useRef } from "react";
import Plot from "react-plotly.js";
import TradingModeToggle from "./TradingModeToggle";
import SignalDisplay from "./SignalDisplay";
import ChartControls from "./ChartControls";
import PriceSummary from "./PriceSummary";
import Celebration from "./Celebration";
import TechnicalIndicatorsPanel from "./TechnicalIndicatorsPanel";
import { placeOrder } from "../services/api";
import { loadExcelData, getStockLevels } from "../services/excelService";

const CandlestickChart = ({ data, symbol }) => {
  const [chartType, setChartType] = useState("candlestick");
  const [quantity, setQuantity] = useState(1);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [celebrate, setCelebrate] = useState(""); 
  const [tradingMode, setTradingMode] = useState("auto"); // Auto mode by default
  const [executingOrder, setExecutingOrder] = useState(null);
  
  // Excel data states
  const [excelData, setExcelData] = useState([]);
  const [triggerLevels, setTriggerLevels] = useState([]);
  const [triggeredLevels, setTriggeredLevels] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");

  // Technical Analysis States
  const [technicalIndicators, setTechnicalIndicators] = useState({
    sma: { period: 20, visible: false, color: "#FF6B00" },
    ema: { period: 20, visible: false, color: "#00C853" },
    rsi: { period: 14, visible: false, color: "#8E24AA" },
    bollinger: { period: 20, visible: false, color: "#2962FF" },
    volume: { visible: true, color: "#42a5f5" }
  });

  // Sidebar states - FIXED: Default both sidebars visible
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const chartRef = useRef(null);
  const plotDivRef = useRef(null);

  const primaryColor = "#42a5f5";

  // Mouse wheel zoom handler
  const handleWheel = useCallback((event) => {
    if (plotDivRef.current && plotDivRef.current.contains(event.target)) {
      event.preventDefault();
    }
  }, []);

  // Add wheel event listener
  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => chartElement.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      } else if (chartRef.current.webkitRequestFullscreen) {
        chartRef.current.webkitRequestFullscreen();
      } else if (chartRef.current.msRequestFullscreen) {
        chartRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load Excel file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await loadExcelData(file);
      setExcelData(data);
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
    } else {
      setTriggerLevels([]);
    }
  }, [selectedStock, excelData]);

  // Technical Indicator Calculations
  const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateEMA = (data, period) => {
    const ema = [];
    const multiplier = 2 / (period + 1);
    ema[0] = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema[i] = (data[i] - ema[i-1]) * multiplier + ema[i-1];
    }
    return ema;
  };

  // Generate technical indicator traces
  const generateTechnicalTraces = () => {
    const traces = [];
    if (!data?.length) return traces;

    const closes = data.map(d => d.Close ?? d.close);
    const dates = data.map(d => new Date(d.date));

    // SMA
    if (technicalIndicators.sma.visible) {
      const sma = calculateSMA(closes, technicalIndicators.sma.period);
      const smaDates = dates.slice(technicalIndicators.sma.period - 1);
      
      traces.push({
        x: smaDates,
        y: sma,
        type: 'scatter',
        mode: 'lines',
        name: `SMA ${technicalIndicators.sma.period}`,
        line: { color: technicalIndicators.sma.color, width: 1 },
        yaxis: 'y'
      });
    }

    // EMA
    if (technicalIndicators.ema.visible) {
      const ema = calculateEMA(closes, technicalIndicators.ema.period);
      
      traces.push({
        x: dates,
        y: ema,
        type: 'scatter',
        mode: 'lines',
        name: `EMA ${technicalIndicators.ema.period}`,
        line: { color: technicalIndicators.ema.color, width: 1 },
        yaxis: 'y'
      });
    }

    // Volume
    if (technicalIndicators.volume.visible && data[0]?.Volume) {
      const volumes = data.map(d => d.Volume ?? d.volume);
      traces.push({
        x: dates,
        y: volumes,
        type: 'bar',
        name: 'Volume',
        marker: { color: technicalIndicators.volume.color },
        opacity: 0.3,
        yaxis: 'y2'
      });
    }

    return traces;
  };

  // Check for level triggers - AUTO MODE ENABLED BY DEFAULT
  useEffect(() => {
    if (!data?.length || triggerLevels.length === 0) return;

    const latestPrice = data[data.length - 1].Close || data[data.length - 1].close;
    const newTriggered = [];

    triggerLevels.forEach(level => {
      const threshold = level * 0.001;
      if (Math.abs(latestPrice - level) <= threshold) {
        if (!triggeredLevels.includes(level)) {
          newTriggered.push(level);
          setCelebrate(`🎯 Price triggered! ${selectedStock} reached ₹${level}`);
          
          // Auto trade execution - AUTO MODE DEFAULT
          if (tradingMode === "auto") {
            executeAutoTrade(level, latestPrice);
          }
        }
      }
    });

    if (newTriggered.length > 0) {
      setTriggeredLevels(prev => [...prev, ...newTriggered]);
    }
  }, [data, triggerLevels, selectedStock, triggeredLevels, tradingMode]);

  const executeAutoTrade = async (level, price) => {
    const orderData = {
      order_id: `AUTO_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol: selectedStock,
      exchange: "NSE",
      transaction_type: "BUY",
      quantity,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: price,
    };

    try {
      const result = await placeOrder(orderData);
      recordTransaction(orderData, "BUY", "auto", result, price);
    } catch (err) {
      console.error("Auto trade error:", err);
    }
  };

  // Manual order functions
  const handleBuy = async () => {
    if (!data?.length) return;
    const latest = data[data.length - 1];
    const orderData = {
      order_id: `MANUAL_BUY_${Date.now()}`,
      user_id: "68b17a50dba7d93a5ac110e7",
      symbol: selectedStock || symbol,
      exchange: "NSE",
      transaction_type: "BUY",
      quantity,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latest.Close || latest.close,
    };

    try {
      const result = await placeOrder(orderData);
      recordTransaction(orderData, "BUY", "manual", result, latest.Close || latest.close);
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
      symbol: selectedStock || symbol,
      exchange: "NSE",
      transaction_type: "SELL",
      quantity,
      order_type: "MARKET",
      product: "MIS",
      status: "COMPLETE",
      average_price: latest.Close || latest.close,
    };

    try {
      const result = await placeOrder(orderData);
      recordTransaction(orderData, "SELL", "manual", result, latest.Close || latest.close);
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
      symbol: orderData.symbol,
      orderData: {
        ...orderData,
        executed_at: result?.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        executed_price: executedPrice,
      },
      mode,
    };

    setTransactionHistory((prev) => [...prev, newTransaction]);
    setCelebrate(
      `✅ ${mode.toUpperCase()} ${type} executed: ${orderData.quantity} Qty ${orderData.symbol} @ ₹${executedPrice}`
    );
  };

  // Fixed Sidebar Toggle Buttons - PROPER POSITIONING
  const SidebarToggleButton = ({ side, isVisible, onClick }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 transform -translate-y-1/2 z-50 w-8 h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-300 shadow-lg border-0 ${
        side === 'left' 
          ? `left-0 rounded-r-lg ${isVisible ? '' : 'ml-0'}`
          : `right-0 rounded-l-lg ${isVisible ? '' : 'mr-0'}`
      }`}
      style={{
        left: side === 'left' && !isVisible ? '0' : 'auto',
        right: side === 'right' && !isVisible ? '0' : 'auto',
      }}
    >
      <span className="text-lg font-bold">
        {side === 'left' ? (isVisible ? '‹' : '›') : (isVisible ? '›' : '‹')}
      </span>
    </button>
  );

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600 rounded-xl shadow-lg p-6 border border-gray-200 bg-white">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No chart data available</h3>
        <p className="text-blue-500">Select a different symbol or timeframe</p>
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
          name: selectedStock || symbol,
          increasing: { line: { color: "#00C853" }, fillcolor: "#00C853" },
          decreasing: { line: { color: "#FF5252" }, fillcolor: "#FF5252" },
        }
      : {
          x: dates,
          y: closes,
          type: "scatter",
          mode: "lines",
          line: { color: "#42a5f5", width: 2 },
          name: selectedStock || symbol,
        };

  // Create traces for trigger levels
  const levelTraces = triggerLevels.map((level) => {
    const isTriggered = triggeredLevels.includes(level);
    return {
      x: [dates[0], dates[dates.length - 1]],
      y: [level, level],
      type: 'scatter',
      mode: 'lines',
      name: `Level: ₹${level}`,
      line: {
        color: isTriggered ? '#ff4444' : '#6666ff',
        width: 1.5,
        dash: 'dash'
      },
      hoverinfo: 'name+y'
    };
  });

  const triggerPointTraces = triggeredLevels.map((level) => {
    const latestDate = dates[dates.length - 1];
    return {
      x: [latestDate],
      y: [level],
      type: 'scatter',
      mode: 'markers',
      name: `Triggered: ₹${level}`,
      marker: {
        color: '#ff4444',
        size: 8,
        symbol: 'star'
      },
      showlegend: false,
      hoverinfo: 'name+y'
    };
  });

  const technicalTraces = generateTechnicalTraces();
  const allTraces = [priceTrace, ...levelTraces, ...triggerPointTraces, ...technicalTraces];

  // Layout configuration - WHITE MODE
  const layout = {
    dragmode: "pan",
    margin: { t: 10, r: 10, b: 30, l: 50 },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
    font: { color: "#374151", size: 11 },
    xaxis: { 
      type: "date", 
      rangeslider: { visible: false },
      gridcolor: "#e5e7eb",
      linecolor: "#d1d5db",
      showgrid: true,
      tickformat: '%H:%M',
      tickangle: -45,
      tickcolor: '#6b7280'
    },
    yaxis: { 
      title: '',
      side: 'right',
      gridcolor: "#e5e7eb",
      linecolor: "#d1d5db",
      showgrid: true,
      fixedrange: false,
      tickcolor: '#6b7280'
    },
    yaxis2: {
      title: 'Volume',
      side: 'left',
      gridcolor: "#e5e7eb",
      linecolor: "#d1d5db",
      showgrid: true,
      overlaying: 'y',
      position: 0.0
    },
    showlegend: false,
    hovermode: 'x unified',
  };

  return (
    <div 
      ref={chartRef}
      className={`h-screen flex bg-gray-50 relative overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'
      }`}
    >
      <Celebration trigger={celebrate} />
      
      {/* Left Sidebar - FIXED WIDTH AND POSITION */}
      <div 
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden ${
          leftSidebarVisible ? 'w-80 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-800 font-semibold text-lg">TRADING PANEL</h3>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full ${
                tradingMode === "auto" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
              }`}>
                {tradingMode.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Excel Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Excel Data Import
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {excelData.length > 0 && (
              <div className="mt-3">
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select stock from Excel</option>
                  {[...new Set(excelData.map(item => item.symbol))].map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Trade Buttons */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleBuy}
                className="py-3 bg-green-500 hover:bg-green-600 text-white text-base font-bold rounded-lg transition-colors shadow-md"
              >
                🟢 BUY
              </button>
              <button
                onClick={handleSell}
                className="py-3 bg-red-500 hover:bg-red-600 text-white text-base font-bold rounded-lg transition-colors shadow-md"
              >
                🔴 SELL
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <TradingModeToggle
              setTradingMode={setTradingMode}
            />
          </div>

          {/* Technical Indicators */}
          <div className="mb-6">
            <TechnicalIndicatorsPanel
              indicators={technicalIndicators}
              setIndicators={setTechnicalIndicators}
            />
          </div>

          {/* Trigger Levels */}
          {triggerLevels.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">🎯 Trigger Levels</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {triggerLevels.map(level => (
                  <div key={level} className={`flex justify-between items-center text-sm p-3 rounded-lg ${
                    triggeredLevels.includes(level) 
                      ? 'bg-red-100 text-red-800 border border-red-300' 
                      : 'bg-white text-blue-800 border border-blue-200'
                  }`}>
                    <span className="font-medium">₹{level}</span>
                    {triggeredLevels.includes(level) && (
                      <span className="text-red-500 font-bold">● TRIGGERED</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Left Sidebar Toggle Button - FIXED POSITION */}
      <SidebarToggleButton 
        side="left" 
        isVisible={leftSidebarVisible}
        onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
      />

      {/* Main Chart Area - FIXED LAYOUT */}
      <div className="flex-1 flex flex-col bg-white relative min-w-0">
        {/* Chart Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-800 font-bold text-xl">{selectedStock || symbol}</span>
            <span className="text-green-600 font-mono text-xl">
              ₹{closes[closes.length - 1]?.toFixed(2)}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full ${
              closes[closes.length - 1] >= opens[opens.length - 1] 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {((closes[closes.length - 1] - opens[opens.length - 1]) / opens[opens.length - 1] * 100).toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isFullscreen ? '📱 Exit Fullscreen' : '🖥️ Fullscreen'}
            </button>

            <ChartControls
              chartType={chartType}
              setChartType={setChartType}
              chartTypes={[
                { value: "candlestick", label: "Candlestick" },
                { value: "line", label: "Line Chart" },
              ]}
            />
          </div>
        </div>

        {/* Main Chart - FIXED HEIGHT */}
        <div className="flex-1 relative min-h-0" ref={plotDivRef}>
          <Plot
            data={allTraces}
            layout={layout}
            style={{ width: "100%", height: "100%" }}
            config={{ 
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToAdd: [
                'drawline',
                'drawopenpath', 
                'drawclosedpath',
                'drawcircle',
                'drawrect',
                'eraseshape'
              ],
              modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d'],
              displaylogo: false,
              scrollZoom: true,
              doubleClick: 'reset'
            }}
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span>Open: <strong className="text-gray-800">₹{opens[opens.length - 1]?.toFixed(2)}</strong></span>
              <span>High: <strong className="text-gray-800">₹{Math.max(...highs).toFixed(2)}</strong></span>
              <span>Low: <strong className="text-gray-800">₹{Math.min(...lows).toFixed(2)}</strong></span>
              <span>Close: <strong className="text-gray-800">₹{closes[closes.length - 1]?.toFixed(2)}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <span>Mode: <strong className={tradingMode === "auto" ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>
                {tradingMode.toUpperCase()}
              </strong></span>
              <span>Last Update: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - FIXED WIDTH AND POSITION */}
      <div 
        className={`bg-white border-l border-gray-200 transition-all duration-300 flex flex-col overflow-hidden ${
          rightSidebarVisible ? 'w-80 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-gray-800 font-semibold text-lg">TRADE INFORMATION</h3>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Position Info */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📈 Current Position</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Symbol:</span>
                <span className="text-gray-800 font-semibold">{selectedStock || symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Price:</span>
                <span className="text-green-600 font-bold">₹{closes[closes.length - 1]?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily Change:</span>
                <span className={`font-bold ${
                  closes[closes.length - 1] >= opens[opens.length - 1] ? 'text-green-600' : 'text-red-600'
                }`}>
                  {((closes[closes.length - 1] - opens[opens.length - 1]) / opens[opens.length - 1] * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Recent Trades</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transactionHistory.slice(-8).reverse().map((transaction, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold text-sm ${
                      transaction.type === 'BUY' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type}
                    </span>
                    <span className="text-gray-800 font-bold">₹{transaction.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{transaction.symbol}</span>
                    <span>{transaction.time.split(' ')[1]}</span>
                  </div>
                  <div className="text-right mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.mode === 'auto' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.mode}
                    </span>
                  </div>
                </div>
              ))}
              {transactionHistory.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8 bg-gray-50 rounded-lg border border-gray-200">
                  No trades executed yet
                </div>
              )}
            </div>
          </div>

          {/* Market Statistics */}
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📋 Market Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Session High:</span>
                <span className="text-gray-800 font-medium">₹{Math.max(...highs).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Low:</span>
                <span className="text-gray-800 font-medium">₹{Math.min(...lows).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume Avg:</span>
                <span className="text-gray-800 font-medium">
                  {data[0]?.Volume ? (data.reduce((sum, d) => sum + (d.Volume || 0), 0) / data.length).toFixed(0) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Levels Triggered:</span>
                <span className="text-orange-600 font-bold">{triggeredLevels.length}/{triggerLevels.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Toggle Button - FIXED POSITION */}
      <SidebarToggleButton 
        side="right" 
        isVisible={rightSidebarVisible}
        onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
      />
    </div>
  );
};

export default CandlestickChart;