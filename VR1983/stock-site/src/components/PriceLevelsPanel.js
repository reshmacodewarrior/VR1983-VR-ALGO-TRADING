// components/PriceLevelsPanel.js
import React from 'react';

const PriceLevelsPanel = ({ priceLevels, currentPrice }) => {
  if (!priceLevels || !priceLevels.levels) {
    return <div>No price levels data available</div>;
  }

  // Sort levels by price
  const sortedLevels = [...priceLevels.levels].sort((a, b) => b.price - a.price);

  return (
    <div className="price-levels-panel">
      <h3>Price Levels for {priceLevels.symbol}</h3>
      <p>Current Price: ₹{currentPrice}</p>
      
      <div className="levels-list">
        {sortedLevels.map(level => {
          const distance = Math.abs(level.price - currentPrice);
          const distancePercent = ((distance / currentPrice) * 100).toFixed(2);
          const isAbove = level.price > currentPrice;
          
          return (
            <div 
              key={level.id} 
              className="level-item"
              style={{ borderLeft: `4px solid ${level.color}` }}
            >
              <div className="level-name">{level.name}</div>
              <div className="level-price">₹{level.price}</div>
              <div className="level-distance">
                {isAbove ? 'Above: ' : 'Below: '}{distancePercent}%
              </div>
              <div className="level-strength">
                Strength: {Math.round(level.strength * 100)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceLevelsPanel;