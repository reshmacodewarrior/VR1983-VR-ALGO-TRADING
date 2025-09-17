import React from "react";

const Navigation = ({
  currentView,
  setCurrentView,
  period,
  setPeriod,
  interval,
  setInterval,
}) => {
  const viewOptions = [
    { id: "single", label: "Single Analysis", icon: "🔍" },
    // { id: "queue", label: "Quick Search", icon: "⚡" },
  ];

  const periodOptions = [
    { value: "1d", label: "1 Day" },
    { value: "5d", label: "5 Days" },
    { value: "1mo", label: "1 Month" },
    { value: "3mo", label: "3 Months" },
    { value: "6mo", label: "6 Months" },
    { value: "1y", label: "1 Year" },
  ];

  const intervalOptions = [
    { value: "1m", label: "1 Min" },
    { value: "5m", label: "5 Min" },
    { value: "15m", label: "15 Min" },
    { value: "30m", label: "30 Min" },
    { value: "1h", label: "1 Hour" },
    { value: "1d", label: "1 Day" },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between bg-gradient-to-r from-gray-800 to-blue-900 shadow-xl rounded-2xl p-4 w-full border border-gray-700">
      {/* Navigation Section */}
      <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setCurrentView(option.id)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
              currentView === option.id
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            }`}
          >
            <span className="mr-2 text-lg">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Time Settings */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Interval</label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          >
            {intervalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Navigation;