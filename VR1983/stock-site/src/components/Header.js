import React, { useEffect, useState } from "react";
import { stockAPI } from "../services/api";
import { FaSync, FaArrowUp, FaArrowDown } from "react-icons/fa";

const Header = () => {
  const [indicesData, setIndicesData] = useState({
    nifty50: { value: null, change: null, changePercent: null, loading: true },
    niftyBank: {
      value: null,
      change: null,
      changePercent: null,
      loading: true,
    },
    sensex: { value: null, change: null, changePercent: null, loading: true },
    niftyAuto: {
      value: null,
      change: null,
      changePercent: null,
      loading: true,
    },
    tatamotors: {
      value: null,
      change: null,
      changePercent: null,
      loading: true,
    },
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchIndices();
  }, []);

  const fetchIndices = async () => {
    setIsRefreshing(true);
    try {
      const period = "1d";
      const interval = "1m";

      // Fetch all indices data in parallel
      const [
        nifty50Data,
        niftyBankData,
        sensexData,
        niftyAutoData,
        tatamotorsData,
      ] = await Promise.all([
        stockAPI.getStock("^NSEI", period, interval),
        stockAPI.getStock("^NSEBANK", period, interval),
        stockAPI.getStock("^BSESN", period, interval),
        stockAPI.getStock("^CNXAUTO", period, interval),
        stockAPI.getStock("TATAMOTORS.NS", period, interval),
      ]);

      setIndicesData({
        nifty50: {
          value: nifty50Data?.current_price || null,
          change: nifty50Data?.change || null,
          changePercent: nifty50Data?.change_percent || null,
          loading: false,
        },
        niftyBank: {
          value: niftyBankData?.current_price || null,
          change: niftyBankData?.change || null,
          changePercent: niftyBankData?.change_percent || null,
          loading: false,
        },
        sensex: {
          value: sensexData?.current_price || null,
          change: sensexData?.change || null,
          changePercent: sensexData?.change_percent || null,
          loading: false,
        },
        niftyAuto: {
          value: niftyAutoData?.current_price || null,
          change: niftyAutoData?.change || null,
          changePercent: niftyAutoData?.change_percent || null,
          loading: false,
        },
        tatamotors: {
          value: tatamotorsData?.current_price || null,
          change: tatamotorsData?.change || null,
          changePercent: tatamotorsData?.change_percent || null,
          loading: false,
        },
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching stock data:", err);
      // Set error state but keep previous data
      setIndicesData((prev) => ({
        nifty50: { ...prev.nifty50, loading: false },
        niftyBank: { ...prev.niftyBank, loading: false },
        sensex: { ...prev.sensex, loading: false },
        niftyAuto: { ...prev.niftyAuto, loading: false },
        tatamotors: { ...prev.tatamotors, loading: false },
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format numbers in Indian style with INR symbol
  const formatINR = (num) => {
    if (num === null || num === undefined) return "₹--";
    
    // For large numbers, use lakhs and crores formatting
    if (num >= 10000000) {
      // Crores
      return `₹${(num / 10000000).toFixed(2)}Cr`;
    } else if (num >= 100000) {
      // Lakhs
      return `₹${(num / 100000).toFixed(2)}L`;
    } else {
      // Regular formatting with commas
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return "--";
    const formattedChange = change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
    return `${formattedChange}`;
  };

  const formatPercent = (percent) => {
    if (percent === null || percent === undefined) return "--";
    return percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change === null || change === undefined) return "text-gray-400";
    return change >= 0 ? "text-green-400" : "text-red-400";
  };

  const getChangeIcon = (change) => {
    if (change === null || change === undefined) return null;
    return change >= 0 ? (
      <FaArrowUp className="inline ml-1 text-green-400" />
    ) : (
      <FaArrowDown className="inline ml-1 text-red-400" />
    );
  };

  const IndexCard = ({ title, data, indexKey, isIndex = true }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-4 text-center border border-white/10 min-w-[180px] hover:bg-white/15 transition-all duration-200">
      <div className="text-sm text-blue-200 mb-2 font-medium">{title}</div>
      {data.loading ? (
        <div className="animate-pulse">
          <div className="h-7 bg-white/20 rounded mb-2 mx-auto w-24"></div>
          <div className="h-5 bg-white/20 rounded mx-auto w-16"></div>
        </div>
      ) : (
        <>
          <div className="text-xl font-bold text-white mb-1">
            {formatINR(data.value)}
          </div>
          <div className={`text-sm font-medium ${getChangeColor(data.change)}`}>
            <div className="flex items-center justify-center">
              {formatChange(data.change)} {getChangeIcon(data.change)}
            </div>
            <div className="text-xs mt-1">
              {formatPercent(data.changePercent)}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 text-white shadow-xl py-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Title and Refresh Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              VR Algo Trading Platform
            </h1>
            <p className="text-lg text-blue-200">
              Advanced algorithmic trading with real-time market intelligence
            </p>
          </div>

          <button
            onClick={fetchIndices}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 hover:scale-105"
          >
            <FaSync className={`${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Updating..." : "Refresh Data"}
          </button>
        </div>

        {/* Market Indices */}
        <div className="flex flex-wrap justify-center gap-4">
          <IndexCard
            title="NIFTY 50"
            data={indicesData.nifty50}
            indexKey="nifty50"
            isIndex={true}
          />
          <IndexCard
            title="BANK NIFTY"
            data={indicesData.niftyBank}
            indexKey="niftyBank"
            isIndex={true}
          />
          <IndexCard
            title="SENSEX"
            data={indicesData.sensex}
            indexKey="sensex"
            isIndex={true}
          />
          <IndexCard
            title="NIFTY AUTO"
            data={indicesData.niftyAuto}
            indexKey="niftyAuto"
            isIndex={true}
          />
         
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-center mt-4 text-blue-200 text-sm">
            Last updated: {lastUpdated.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;