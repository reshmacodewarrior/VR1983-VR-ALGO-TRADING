import React, { useState, useEffect } from "react";

/**
 * OrderViewPanel
 * - Parses various timestamp shapes (string, { $date: "..." }, number)
 * - Treats naive ISO strings from your server as UTC (appends 'Z') so they map correctly to IST
 * - Formats time in Asia/Kolkata and shows "Sep 24 / 4:56 PM" style
 */
const OrderViewPanel = ({ orderData = [], loading, error, onRefresh, primaryColor = "#42a5f5" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = orderData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = orderData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [orderData]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount ?? 0);

  // Robust parser: handles { $date: "..." }, plain ISO strings (with/without timezone),
  // and numeric timestamps.
  const parseToDate = (ts) => {
    if (!ts) return null;

    // Unwrap MongoDB style {$date: "..."}
    let raw = ts;
    if (typeof ts === "object" && ts !== null) {
      if ("$date" in ts) raw = ts.$date;
      else if ("$numberLong" in ts) raw = Number(ts.$numberLong);
      else if (ts instanceof Date) return ts;
    }

    // If numeric epoch
    if (typeof raw === "number") return new Date(raw);

    // If string, ensure correct timezone handling:
    if (typeof raw === "string") {
      // If string contains Z or timezone offset, use directly
      if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(raw)) {
        const d = new Date(raw);
        if (!isNaN(d)) return d;
      }

      // If it looks like an ISO without timezone (e.g. "2025-09-13T06:23:47.153"),
      // the server likely used datetime.utcnow().isoformat() (no 'Z') — treat as UTC by appending 'Z'
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(raw)) {
        const d = new Date(raw + "Z"); // interpret as UTC
        if (!isNaN(d)) return d;
      }

      // Fallback: let Date try to parse
      const fallback = new Date(raw);
      if (!isNaN(fallback)) return fallback;
    }

    // Last resort
    const asDate = new Date(raw);
    return isNaN(asDate) ? null : asDate;
  };

  // Format date/time in IST (Asia/Kolkata) as "Sep 24 / 4:56 PM"
  const formatTimestamp = (timestamp) => {
    const dateObj = parseToDate(timestamp);
    if (!dateObj) return "–";

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "2-digit",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const datePart = dateFormatter.format(dateObj); // e.g. "Sep 24"
    const timePart = timeFormatter.format(dateObj); // e.g. "4:56 PM"

    return `${datePart} / ${timePart}`;
  };

  const getTypeColor = (type) => {
    if (!type) return "text-gray-500";
    return type.toLowerCase() === "buy"
      ? "text-green-600 font-semibold"
      : "text-red-600 font-semibold";
  };

  // P&L: show arrow and absolute percent
  const renderPnL = (order) => {
    const orderPrice =
      order.order_price ?? order.orderPrice ?? order.average_price ?? order.averagePrice ?? 0;
    const qty = Number(order.quantity ?? 0);
    const pnl = Number(order.profit_loss ?? 0);
    const denom = orderPrice * qty;
    const pct = denom ? Math.abs((pnl / denom) * 100).toFixed(2) : "0.00";

    if (pnl > 0) {
      return (
        <span className="flex items-center space-x-1 text-green-600">
          <span aria-hidden>▲</span>
          <span>{`${formatCurrency(pnl)} (+${pct}%)`}</span>
        </span>
      );
    } else if (pnl < 0) {
      return (
        <span className="flex items-center space-x-1 text-red-600">
          <span aria-hidden>▼</span>
          <span>{`${formatCurrency(pnl)} (-${pct}%)`}</span>
        </span>
      );
    } else {
      return <span className="text-gray-500">–</span>;
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch ((riskLevel || "").toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-500";
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10) || 10);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div 
        className="bg-white border rounded-xl p-4 mt-4 shadow-lg"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>Order View</h3>
        <div className="flex justify-center items-center h-32">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-white border rounded-xl p-4 mt-4 shadow-lg"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>Order View</h3>
        <div className="text-red-600 p-4 text-center">
          Error loading order data: {error}
          <button
            onClick={onRefresh}
            className="ml-2 px-3 py-1 rounded text-white hover:scale-105 transition-all"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1e88e5';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = primaryColor;
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border rounded-xl p-4 mt-4 shadow-lg"
      style={{ borderColor: `${primaryColor}20` }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>Order View</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border rounded px-2 py-1 text-sm transition-colors"
              style={{
                borderColor: `${primaryColor}40`,
                backgroundColor: 'white'
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 rounded text-sm text-white hover:scale-105 transition-all"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1e88e5';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = primaryColor;
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="text-gray-500 p-4 text-center">
          No orders found. Start trading to see your order history.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="min-w-full divide-y" style={{ borderColor: `${primaryColor}20` }}>
              <thead className="sticky top-0" style={{ backgroundColor: `${primaryColor}05` }}>
                <tr>
                  {["Order ID", "Symbol", "Type", "Order Price", "Current Price", "Quantity", "Profit & Loss", "Risk Level", "Time stamp"].map((header) => (
                    <th 
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: primaryColor, borderColor: `${primaryColor}20` }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: `${primaryColor}10` }}>
                {currentItems.map((order) => (
                  <tr 
                    key={order.order_id ?? order.orderId} 
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderColor: `${primaryColor}10` }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{order.order_id ?? order.orderId}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: primaryColor }}>{order.symbol}</td>
                    <td className={`px-4 py-3 text-sm ${getTypeColor(order.transaction_type ?? order.type ?? order.transactionType)}`}>
                      {order.transaction_type ?? order.type ?? order.transactionType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(order.order_price ?? order.orderPrice ?? order.average_price ?? order.averagePrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(order.current_price ?? order.currentPrice ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.quantity}</td>
                    <td className="px-4 py-3 text-sm font-medium">{renderPnL(order)}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${getRiskLevelColor(order.risk_level ?? order.riskLevel)}`}>
                      {order.risk_level ?? order.riskLevel ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatTimestamp(order.timestamp ?? order.order_timestamp ?? order.executed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  currentPage === 1 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "text-white hover:scale-105"
                }`}
                style={{ 
                  backgroundColor: currentPage === 1 ? undefined : primaryColor 
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) e.target.style.backgroundColor = '#1e88e5';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) e.target.style.backgroundColor = primaryColor;
                }}
              >
                First
              </button>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  currentPage === 1 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "text-white hover:scale-105"
                }`}
                style={{ 
                  backgroundColor: currentPage === 1 ? undefined : primaryColor 
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) e.target.style.backgroundColor = '#1e88e5';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) e.target.style.backgroundColor = primaryColor;
                }}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button 
                    key={pageNum} 
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      currentPage === pageNum 
                        ? "text-white" 
                        : "text-white hover:scale-105"
                    }`}
                    style={{ 
                      backgroundColor: currentPage === pageNum ? '#1e88e5' : primaryColor 
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== pageNum) e.target.style.backgroundColor = '#1e88e5';
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== pageNum) e.target.style.backgroundColor = primaryColor;
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  currentPage === totalPages 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "text-white hover:scale-105"
                }`}
                style={{ 
                  backgroundColor: currentPage === totalPages ? undefined : primaryColor 
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) e.target.style.backgroundColor = '#1e88e5';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) e.target.style.backgroundColor = primaryColor;
                }}
              >
                Next
              </button>
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  currentPage === totalPages 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "text-white hover:scale-105"
                }`}
                style={{ 
                  backgroundColor: currentPage === totalPages ? undefined : primaryColor 
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) e.target.style.backgroundColor = '#1e88e5';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) e.target.style.backgroundColor = primaryColor;
                }}
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderViewPanel;