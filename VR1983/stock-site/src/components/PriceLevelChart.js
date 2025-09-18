// components/PriceLevelChart.js
import React from 'react';
import Plot from 'react-plotly.js';

const PriceLevelChart = ({ data, priceLevels, tradingSignals }) => {
  if (!data?.length || !priceLevels) {
    return <div>Loading chart data...</div>;
  }

  const dates = data.map(d => new Date(d.date));
  const closes = data.map(d => d.close);
  
  // Prepare price level traces
  const levelTraces = priceLevels.levels.map(level => ({
    x: [dates[0], dates[dates.length - 1]],
    y: [level.price, level.price],
    type: 'scatter',
    mode: 'lines',
    name: level.name,
    line: {
      color: level.color,
      width: 2,
      dash: level.type === 'support' ? 'dash' : 'dot'
    }
  }));

  // Prepare signal markers
  const buySignals = tradingSignals.filter(s => s.signal === 'BUY');
  const sellSignals = tradingSignals.filter(s => s.signal === 'SELL');
  const holdSignals = tradingSignals.filter(s => s.signal === 'HOLD');

  const buyTrace = {
    x: buySignals.map(s => new Date(s.timestamp)),
    y: buySignals.map(s => s.price),
    type: 'scatter',
    mode: 'markers',
    name: 'Buy Signals',
    marker: {
      color: 'green',
      symbol: 'triangle-up',
      size: 12
    }
  };

  const sellTrace = {
    x: sellSignals.map(s => new Date(s.timestamp)),
    y: sellSignals.map(s => s.price),
    type: 'scatter',
    mode: 'markers',
    name: 'Sell Signals',
    marker: {
      color: 'red',
      symbol: 'triangle-down',
      size: 12
    }
  };

  const holdTrace = {
    x: holdSignals.map(s => new Date(s.timestamp)),
    y: holdSignals.map(s => s.price),
    type: 'scatter',
    mode: 'markers',
    name: 'Hold Signals',
    marker: {
      color: 'orange',
      symbol: 'diamond',
      size: 10
    }
  };

  // Main price trace
  const priceTrace = {
    x: dates,
    y: closes,
    type: 'candlestick',
    name: priceLevels.symbol,
    increasing: { line: { color: 'green' }, fillcolor: 'green' },
    decreasing: { line: { color: 'red' }, fillcolor: 'red' }
  };

  return (
    <Plot
      data={[priceTrace, ...levelTraces, buyTrace, sellTrace, holdTrace]}
      layout={{
        title: `${priceLevels.symbol} with Price Levels`,
        xaxis: { type: 'date', rangeslider: { visible: false } },
        yaxis: { title: 'Price' },
        showlegend: true,
        legend: { x: 0, y: 1 },
        hovermode: 'closest'
      }}
      style={{ width: '100%', height: '600px' }}
      config={{ responsive: true }}
    />
  );
};

export default PriceLevelChart;