import React, { useEffect, useState } from "react";

const Celebration = ({ trigger }) => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(100);

  // Primary color from your site
  const primaryColor = "#42a5f5";

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setProgress(100);
      
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - 1));
      }, 50);

      const timer = setTimeout(() => {
        setShow(false);
        clearInterval(progressInterval);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [trigger]);

  if (!show) return null;

  // Determine alert type based on message content
  const getAlertType = () => {
    if (trigger.includes("BUY")) return "success";
    if (trigger.includes("SELL")) return "warning";
    if (trigger.includes("HOLD")) return "info";
    if (trigger.includes("COMPLETED")) return "success";
    return "info";
  };

  const alertConfig = {
    success: {
      bgColor: "bg-white",
      borderColor: "border-green-300",
      textColor: "text-green-700",
      accentColor: "text-green-600",
      icon: "✅",
      title: "Trade Executed",
      gradient: "from-green-50 to-white"
    },
    warning: {
      bgColor: "bg-white",
      borderColor: "border-red-300",
      textColor: "text-red-700",
      accentColor: "text-red-600",
      icon: "📊",
      title: "Trade Executed",
      gradient: "from-red-50 to-white"
    },
    info: {
      bgColor: "bg-white",
      borderColor: `border-[${primaryColor}30]`,
      textColor: "text-gray-700",
      accentColor: `text-[${primaryColor}]`,
      icon: "ℹ️",
      title: "Market Signal",
      gradient: `from-[${primaryColor}10] to-white`
    }
  };

  const config = alertConfig[getAlertType()];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-right-8 duration-300">
      <div 
        className={`
          ${config.bgColor}
          border ${config.borderColor}
          ${config.textColor}
          rounded-xl shadow-lg shadow-black/5 p-4 
          transform transition-all duration-300 ease-in-out
          backdrop-blur-sm bg-gradient-to-br ${config.gradient}
          hover:shadow-xl hover:shadow-black/10
          border-l-4 ${config.borderColor}
        `}
        role="alert"
      >
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 text-xl mr-3 ${config.accentColor}`}>
            {config.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm mb-1 ${config.accentColor}`}>
                  {config.title}
                </h3>
                <p className="text-sm leading-relaxed break-words">
                  {trigger.replace("✅ ", "").replace("🎉 ", "").replace("❌ ", "")}
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShow(false)}
                className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100 p-1"
                aria-label="Close notification"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
              <div 
                className={`h-1 rounded-full transition-all duration-100 ease-out ${config.accentColor.replace('text', 'bg')}`}
                style={{ 
                  width: `${progress}%`,
                  transition: 'width 50ms linear'
                }}
              />
            </div>
            
            {/* Timestamp */}
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true 
                })}
              </span>
              <span className="text-xs text-gray-500">
                Auto-closes in {Math.ceil(progress / 20)}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Celebration;