// src/components/StrategyList.js
import React, { useState } from 'react';
import { deleteStrategy } from '../services/strategyApi';

export default function StrategyList({ 
  strategies, 
  selectedStrategy, 
  onSelectStrategy, 
  onStrategyUpdate,
  showActions = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const primaryColor = "#42a5f5";

  const filteredStrategies = strategies.filter(strategy =>
    strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    strategy.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (strategyId, strategyName) => {
    if (window.confirm(`Are you sure you want to delete "${strategyName}"?`)) {
      try {
        await deleteStrategy(strategyId);
        onStrategyUpdate();
      } catch (error) {
        alert('Failed to delete strategy: ' + error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border" 
      style={{ borderColor: `${primaryColor}20` }}>
      
      <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
        📂 My Strategies
      </h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search strategies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1"
          style={{ 
            borderColor: `${primaryColor}40`,
            focusBorderColor: primaryColor
          }}
        />
      </div>

      {/* Strategy List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredStrategies.map(strategy => (
          <div
            key={strategy.id}
            onClick={() => onSelectStrategy(strategy)}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              selectedStrategy?.id === strategy.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{strategy.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {strategy.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {strategy.language}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {showActions && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(strategy.id, strategy.name);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete strategy"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredStrategies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {strategies.length === 0 ? 'No strategies yet' : 'No strategies found'}
            <br />
            <span className="text-sm">Create your first strategy!</span>
          </div>
        )}
      </div>
    </div>
  );
}