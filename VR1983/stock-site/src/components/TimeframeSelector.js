import React from 'react';

const TimeframeSelector = ({ timeframe, setTimeframe, timeframes }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Timeframe:</label>
      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
        className="px-3 py-1 border rounded text-sm bg-white"
      >
        {timeframes.map(tf => (
          <option key={tf} value={tf}>{tf}</option>
        ))}
      </select>
    </div>
  );
};

export default TimeframeSelector;