import React from "react";

const Navigation = ({
  currentView,
  setCurrentView,
  period,
  setPeriod,
  interval,
  setInterval,
}) => {
  // Primary color for the theme
  const primaryColor = "#42a5f5";

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
    { value: "5y", label: "5 Years" },
  ];

  const intervalOptions = [
    { value: "1m", label: "1 Min" },
    { value: "5m", label: "5 Min" },
    { value: "15m", label: "15 Min" },
    { value: "30m", label: "30 Min" },
    { value: "1h", label: "1 Hour" },
    { value: "1d", label: "1 Day" },
    { value: "1mo", label: "1 Month" },
    { value: "3mo", label: "3 Months" },
  ];

  return (
    <div 
      className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between bg-white shadow-lg rounded-2xl p-4 w-full border transition-all duration-300"
      style={{ borderColor: `${primaryColor}20` }}
    >
      {/* Navigation Section */}
      <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setCurrentView(option.id)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
              currentView === option.id
                ? "text-white font-semibold shadow-lg hover:scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            }`}
            style={{
              backgroundColor: currentView === option.id ? primaryColor : undefined,
            }}
            onMouseEnter={(e) => {
              if (currentView !== option.id) {
                e.target.style.backgroundColor = `${primaryColor}10`;
                e.target.style.color = primaryColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== option.id) {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#374151';
              }
            }}
          >
            <span className="mr-2 text-lg">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Time Settings */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1">
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: primaryColor }}
          >
            Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 shadow-inner transition-colors"
            style={{
              backgroundColor: 'white',
              color: '#1f2937',
              borderColor: `${primaryColor}40`,
              focusBorderColor: primaryColor,
              focusRingColor: `${primaryColor}20`
            }}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: primaryColor }}
          >
            Interval
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 shadow-inner transition-colors"
            style={{
              backgroundColor: 'white',
              color: '#1f2937',
              borderColor: `${primaryColor}40`,
              focusBorderColor: primaryColor,
              focusRingColor: `${primaryColor}20`
            }}
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