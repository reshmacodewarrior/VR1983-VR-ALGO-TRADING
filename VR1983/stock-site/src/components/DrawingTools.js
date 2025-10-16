import React from 'react';

const DrawingTools = ({ tools, setTools }) => {
  const toggleTool = (tool) => {
    setTools(prev => ({
      ...prev,
      [tool]: !prev[tool]
    }));
  };

  return (
    <div className="mb-4 p-3 rounded-lg border" style={{ 
      backgroundColor: '#f8fafc',
      borderColor: '#e2e8f0'
    }}>
      <h4 className="font-medium mb-2 text-gray-700">✏️ Drawing Tools</h4>
      <div className="flex flex-wrap gap-2">
        {Object.keys(tools).map(tool => (
          <button
            key={tool}
            onClick={() => toggleTool(tool)}
            className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
              tools[tool] 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DrawingTools;