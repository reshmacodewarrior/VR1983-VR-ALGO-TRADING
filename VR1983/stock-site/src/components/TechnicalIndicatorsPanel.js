import React from 'react';

const TechnicalIndicatorsPanel = ({ indicators, setIndicators, compact = false }) => {
  const updateIndicator = (indicator, field, value) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: {
        ...prev[indicator],
        [field]: value
      }
    }));
  };

  if (compact) {
    return (
      <div className="mb-3">
        <h4 className="font-medium text-sm text-gray-700 mb-2">📈 Indicators</h4>
        <div className="space-y-2">
          {['sma', 'ema', 'rsi', 'bollinger', 'volume'].map(indicator => (
            <div key={indicator} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={indicators[indicator].visible}
                  onChange={(e) => updateIndicator(indicator, 'visible', e.target.checked)}
                  className="rounded text-blue-500"
                />
                <span className="text-sm capitalize">{indicator}</span>
              </div>
              {(indicator === 'sma' || indicator === 'ema') && (
                <input
                  type="number"
                  value={indicators[indicator].period}
                  onChange={(e) => updateIndicator(indicator, 'period', parseInt(e.target.value))}
                  className="w-12 px-1 py-0.5 text-xs border rounded"
                  min="1"
                  max="200"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <h4 className="font-medium text-sm text-gray-700 mb-2">📈 Technical Indicators</h4>
      <div className="space-y-2">
        {/* SMA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={indicators.sma.visible}
              onChange={(e) => updateIndicator('sma', 'visible', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">SMA</span>
          </div>
          <input
            type="number"
            value={indicators.sma.period}
            onChange={(e) => updateIndicator('sma', 'period', parseInt(e.target.value))}
            className="w-12 px-1 py-0.5 text-sm border rounded"
            min="1"
            max="200"
          />
        </div>

        {/* EMA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={indicators.ema.visible}
              onChange={(e) => updateIndicator('ema', 'visible', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">EMA</span>
          </div>
          <input
            type="number"
            value={indicators.ema.period}
            onChange={(e) => updateIndicator('ema', 'period', parseInt(e.target.value))}
            className="w-12 px-1 py-0.5 text-sm border rounded"
            min="1"
            max="200"
          />
        </div>

        {/* Other indicators... */}
        {['rsi', 'bollinger', 'volume'].map(indicator => (
          <div key={indicator} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={indicators[indicator].visible}
              onChange={(e) => updateIndicator(indicator, 'visible', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm capitalize">{indicator}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalIndicatorsPanel;