import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import TradingModeToggle from "./TradingModeToggle";
import SignalDisplay from "./SignalDisplay";
import ChartControls from "./ChartControls";
import PriceSummary from "./PriceSummary";
import Celebration from "./Celebration";
import { placeOrder } from "../services/api";
import * as XLSX from 'xlsx';

const CandlestickChart = ({ data, symbol }) => {
  const [chartType, setChartType] = useState("candlestick");
  const [quantity, setQuantity] = useState(1);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [celebrate, setCelebrate] = useState(""); 
  const [tradingMode, setTradingMode] = useState("manual");
  const [executingOrder, setExecutingOrder] = useState(null);
  
  // States for Excel data and levels
  const [excelData, setExcelData] = useState([]);
  const [triggerLevels, setTriggerLevels] = useState([]);
  const [triggeredLevels, setTriggeredLevels] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const primaryColor = "#42a5f5";

  // Load Excel file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await loadExcelData(file);
      setExcelData(data);
      console.log("✅ Excel file loaded successfully:", data.length, "records");
    } catch (error) {
      console.error("Error loading Excel file:", error);
      alert("Error loading Excel file. Please check the format. Required columns: 'stock name' and 'levels'");
    }
  };

  // Excel data loader function
  const loadExcelData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          console.log('Raw Excel data:', jsonData);

          if (jsonData.length === 0) {
            throw new Error('No data found in Excel file');
          }

          // Process data for your specific format
          const processedData = jsonData.map((item, index) => {
            // Your file has columns: "stock name" and "levels"
            const symbol = item['stock name'] || item['Stock Name'] || item.stock || item.STOCK;
            const level = item.levels || item.Level || item.level || item.PRICE;

            if (!symbol || level === undefined || level === null) {
              console.warn(`Row ${index} missing symbol or level:`, item);
              return null;
            }

            let processedSymbol = symbol.toString().trim();
            
            // Add .NS suffix if not present
            if (!processedSymbol.includes('.') && !processedSymbol.includes('.NS') && !processedSymbol.includes('.BO')) {
              processedSymbol = `${processedSymbol}.NS`;
            }
            
            const processedLevel = parseFloat(level);
            
            if (isNaN(processedLevel)) {
              console.warn(`Invalid level value in row ${index}:`, level);
              return null;
            }

            return {
              originalSymbol: symbol.toString().trim(),
              symbol: processedSymbol,
              level: processedLevel,
              name: symbol.toString().trim()
            };
          }).filter(item => item !== null);

          if (processedData.length === 0) {
            throw new Error('No valid data found. Please check if your Excel has "stock name" and "levels" columns.');
          }

          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Get levels for selected stock
  const getStockLevels = (excelData, selectedSymbol) => {
    if (!excelData || !selectedSymbol) return [];
    
    return excelData
      .filter(item => item.symbol === selectedSymbol)
      .map(item => item.level);
  };

  // Update trigger levels when stock selection changes
  useEffect(() => {
    if (selectedStock && excelData.length > 0) {
      const levels = getStockLevels(excelData, selectedStock);
      setTriggerLevels(levels);
      setTriggeredLevels([]); // Reset triggered levels when stock changes
      console.log(`📊 Set ${levels.length} trigger levels for ${selectedStock}:`, levels);
    } else {
      setTriggerLevels([]);
      setTriggeredLevels([]);
    }
  }, [selectedStock, excelData]);

  // Check for level triggers in real-time
  useEffect(() => {
    if (!data?.length || triggerLevels.length === 0) return;

    const latestPrice = data[data.length - 1].Close || data[data.length - 1].close;
    const newTriggered = [];

    triggerLevels.forEach(level => {
      // Check if price is within 0.5% of the trigger level
      const threshold = level * 0.005; // 0.5% threshold
      if (Math.abs(latestPrice - level) <= threshold) {
        if (!triggeredLevels.includes(level)) {
          newTriggered.push(level);
          // Show notification
          setCelebrate(`🎯 Price Triggered! ${selectedStock} reached ₹${level}`);
        }
      }
    });

    if (newTriggered.length > 0) {
      setTriggeredLevels(prev => [...prev, ...newTriggered]);
    }
  }, [data, triggerLevels, selectedStock, triggeredLevels]);

  // Get unique stocks for dropdown
  const uniqueStocks = [...new Set(excelData.map(item => item.symbol))];

  // Filter stocks based on search term
  const filteredStocks = uniqueStocks.filter(stock => 
    stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle stock selection
  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setSearchTerm(stock); // Set search term to selected stock
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.stock-selector-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manual Orders
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

  // Create traces for trigger levels (horizontal lines)
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
        width: 3,
        dash: isTriggered ? 'solid' : 'dash'
      },
      hoverinfo: 'y+name'
    };
  });

  // Create traces for triggered points (dots on the latest price)
  const triggerPointTraces = triggeredLevels.map((level, index) => {
    const latestDate = dates[dates.length - 1];
    const latestPrice = closes[closes.length - 1];
    
    return {
      x: [latestDate],
      y: [level],
      type: 'scatter',
      mode: 'markers+text',
      name: `Triggered: ₹${level}`,
      text: [`🎯`],
      textposition: 'top center',
      marker: {
        color: '#ff4444',
        size: 15,
        symbol: 'diamond'
      },
      showlegend: false,
      hoverinfo: 'y+name'
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
      
      {/* Excel File Upload Section */}
      <div className="mb-4 p-3 rounded-lg border" style={{ 
        backgroundColor: `${primaryColor}05`,
        borderColor: `${primaryColor}20`
      }}>
        <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
          📁 Upload Stock Levels Excel File
        </label>
        <p className="text-xs text-gray-600 mb-2">
          Required columns: <strong>"stock name"</strong> and <strong>"levels"</strong>
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="w-full px-3 py-2 border rounded-md text-sm mb-2"
          style={{
            borderColor: `${primaryColor}40`,
            backgroundColor: 'white'
          }}
        />
        
        {excelData.length > 0 && (
          <div className="text-xs text-green-600 mb-2">
            ✅ Loaded {excelData.length} stock levels
          </div>
        )}
        
        {/* Stock Selection with Search */}
        {excelData.length > 0 && (
          <div className="stock-selector-container relative">
            <label className="block text-sm font-medium mb-2" style={{ color: primaryColor }}>
              📈 Select Stock to Plot Levels
            </label>
            
            {/* Search Input */}
            <div className="relative mb-1">
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full px-3 py-2 pl-9 border rounded-md text-sm"
                style={{
                  borderColor: `${primaryColor}40`,
                  backgroundColor: 'white',
                  color: '#1f2937'
                }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setIsDropdownOpen(true);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown with search results */}
            {isDropdownOpen && filteredStocks.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredStocks.map(stock => (
                  <div
                    key={stock}
                    onClick={() => handleStockSelect(stock)}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm ${
                      selectedStock === stock ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                    }`}
                  >
                    {stock}
                  </div>
                ))}
              </div>
            )}

            {/* No results message */}
            {isDropdownOpen && searchTerm && filteredStocks.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="px-3 py-2 text-sm text-gray-500">
                  No stocks found for "{searchTerm}"
                </div>
              </div>
            )}

            {/* Selected stock info */}
            {selectedStock && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <span className="font-medium text-green-800">Selected:</span> {selectedStock}
                {triggerLevels.length > 0 && (
                  <span className="text-green-600 ml-2">
                    ({triggerLevels.length} level{triggerLevels.length !== 1 ? 's' : ''} loaded)
                  </span>
                )}
              </div>
            )}
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

      {/* Trigger Levels Information */}
      {triggerLevels.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border" style={{ 
          backgroundColor: `${primaryColor}05`,
          borderColor: `${primaryColor}20`
        }}>
          <h4 className="font-medium mb-2" style={{ color: primaryColor }}>
            🎯 Trigger Levels for {selectedStock}
          </h4>
          <div className="flex flex-wrap gap-2">
            {triggerLevels.map(level => (
              <span
                key={level}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  triggeredLevels.includes(level) 
                    ? 'bg-red-100 text-red-800 border-2 border-red-400' 
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                ₹{level} {triggeredLevels.includes(level) && '🎯 TRIGGERED'}
              </span>
            ))}
          </div>
          {triggeredLevels.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm font-medium">
                ⚡ {triggeredLevels.length} level(s) triggered! Current price is near these levels.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chart Container */}
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
              linecolor: `${primaryColor}30`,
              title: {
                text: 'Price (₹)',
                font: { color: primaryColor }
              }
            },
            showlegend: true,
            legend: {
              x: 0,
              y: 1.1,
              orientation: 'h',
              bgcolor: 'rgba(255,255,255,0.8)'
            },
            title: {
              text: `${selectedStock || symbol} - Price Chart with Trigger Levels`,
              font: { color: primaryColor, size: 16 }
            }
          }}
          style={{ width: "100%", height: "500px" }}
          config={{ 
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }}
        />
      </div>
    </div>
  );
};

export default CandlestickChart;