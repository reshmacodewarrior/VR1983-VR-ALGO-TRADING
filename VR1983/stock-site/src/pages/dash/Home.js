import React from "react";
import { Link } from "react-router-dom";
import { 
  FaChartLine, 
  FaRobot, 
  FaShieldAlt, 
  FaMobileAlt,
  FaArrowRight,
  FaHeadset,
  FaLightbulb
} from "react-icons/fa";

import img4 from "../../asset/carousal-4.jpg";

// Primary color
const primaryColor = "#42a5f5";

// Feature cards data
const features = [
  {
    icon: <FaChartLine className="text-2xl" />,
    title: "Live Market Data",
    description: "Real-time market feeds with advanced charting tools and technical indicators",
    gradient: "from-blue-50 to-blue-100",
    link: "/livemarket",
    stats: "0.002s latency"
  },
  {
    icon: <FaRobot className="text-2xl" />,
    title: "AI Strategies",
    description: "Machine learning powered trading algorithms that adapt to market conditions",
    gradient: "from-blue-50 to-blue-100",
    link: "/strategies",
    stats: "150+ algorithms"
  },
  {
    icon: <FaShieldAlt className="text-2xl" />,
    title: "Secure Trading",
    description: "Bank-level security with encrypted transactions and multi-factor authentication",
    gradient: "from-blue-50 to-blue-100",
    link: "/security",
    stats: "99.9% uptime"
  },
  {
    icon: <FaMobileAlt className="text-2xl" />,
    title: "Multi-Platform",
    description: "Access your trading account from any device with seamless synchronization",
    gradient: "from-blue-50 to-blue-100",
    link: "/platforms",
    stats: "VR & Mobile"
  }
];

// Stats data
const stats = [
  { value: "99.9%", label: "Platform Uptime", icon: "🔄" },
  { value: "0.002s", label: "Execution Speed", icon: "⚡" },
  { value: "150+", label: "Trading Pairs", icon: "📊" },
  { value: "24/7", label: "Customer Support", icon: "🛡️" }
];

// Trading features cards
const tradingFeatures = [
  {
    name: "Live Trading",
    description: "Execute trades in real-time with advanced order types",
    status: "Active",
    icon: "📈",
    features: ["Real-time execution", "Advanced orders", "Live portfolio"]
  },
  {
    name: "Desktop Pro",
    description: "Advanced desktop platform with full features",
    status: "Live", 
    icon: "💻",
    features: ["Full functionality", "Multi-monitor", "Custom layouts"]
  },
  {
    name: "Mobile App",
    description: "Trade on the go with our mobile application",
    status: "Live",
    icon: "📱",
    features: ["Push notifications", "Mobile charts", "Quick trade"]
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-primary-50 container-fluid">
      {/* Hero Section */}
      <div className="relative h-screen max-h-[800px] bg-white overflow-hidden">
        <img 
          src={img4} 
          alt="VR Algo Trading Platform" 
          className="w-full h-full object-cover" 
        />
        
        {/* Enhanced Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="ml-16 max-w-2xl text-white">
            <div className="mb-6">
              <span 
                className="text-white px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                🚀 NEXT GENERATION PLATFORM
              </span>
            </div>
            
            <h1 className="text-6xl font-black mb-6 leading-tight drop-shadow-2xl">
              Immersive
              <br />
              <span 
                className="font-black bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent drop-shadow-lg"
                style={{ textShadow: '0 2px 10px rgba(66, 165, 245, 0.3)' }}
              >
                Algorithmic Trading
              </span>
            </h1>
            
            <p className="text-xl font-medium text-gray-100 mb-8 leading-relaxed drop-shadow-lg max-w-xl">
              Step into the future of trading with our cutting-edge platform. 
              Experience real-time market data with advanced algorithmic strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="text-white px-8 py-4 rounded-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center gap-3 border-2 border-white/20"
                style={{ 
                  backgroundColor: primaryColor,
                  background: `linear-gradient(135deg, ${primaryColor}, #1e88e5)`
                }}
              >
                Start Trading Now
                <FaArrowRight className="text-sm font-bold" />
              </button>
              <button 
                className="border-2 border-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 text-white backdrop-blur-sm bg-white/10"
              >
                Watch Demo
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-black drop-shadow-lg" style={{ color: primaryColor }}>$2.4B+</div>
                <div className="text-gray-200 font-semibold text-sm">Daily Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black drop-shadow-lg" style={{ color: primaryColor }}>50K+</div>
                <div className="text-gray-200 font-semibold text-sm">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black drop-shadow-lg" style={{ color: primaryColor }}>150+</div>
                <div className="text-gray-200 font-semibold text-sm">Markets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white">
          <div className="text-center">
            <div className="text-sm font-semibold mb-2 drop-shadow-lg">Explore More</div>
            <div className="w-6 h-10 border-2 rounded-full flex justify-center border-white/50">
              <div className="w-1 h-3 rounded-full mt-2 bg-white animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-b border-gray-200 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group hover:scale-110 transition-transform duration-300">
              <div className="text-4xl mb-3" style={{ color: primaryColor }}>{stat.icon}</div>
              <div className="text-4xl font-black text-gray-900 mb-3 drop-shadow-sm">{stat.value}</div>
              <div className="text-gray-700 font-bold text-lg tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6 drop-shadow-sm">
              Why Choose Our Platform?
            </h2>
            <p className="text-2xl font-semibold text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Experience the next generation of algorithmic trading with cutting-edge technology and unparalleled performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group"
              >
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-8 h-full border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-blue-400 group-hover:shadow-blue-200`}>
                  <div 
                    className="rounded-xl w-16 h-16 flex items-center justify-center shadow-md mb-6 group-hover:shadow-lg transition-all duration-300 border-2"
                    style={{ 
                      backgroundColor: 'white',
                      borderColor: primaryColor,
                      color: primaryColor
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed mb-6 font-medium text-lg">{feature.description}</p>
                  <div className="text-lg font-black tracking-wide" style={{ color: primaryColor }}>{feature.stats}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trading Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6 drop-shadow-sm">
              Trading Features
            </h2>
            <p className="text-2xl font-semibold text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Access our comprehensive suite of trading tools across all platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tradingFeatures.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-blue-400">
                  <div 
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl mb-6 text-white shadow-lg"
                    style={{ 
                      backgroundColor: primaryColor,
                      background: `linear-gradient(135deg, ${primaryColor}, #1e88e5)`
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{feature.name}</h3>
                  <p className="text-gray-700 font-medium text-lg mb-6">{feature.description}</p>
                  
                  {/* Feature list */}
                  <div className="space-y-3 mb-6">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-base font-semibold text-gray-800">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        ></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-base font-bold ${
                    feature.status === "Active" || feature.status === "Live"
                      ? "bg-green-100 text-green-800 border border-green-300" 
                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      feature.status === "Active" || feature.status === "Live" ? "bg-green-500" : "bg-yellow-500"
                    }`}></div>
                    {feature.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Support Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className="rounded-2xl p-12 border-2 shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}08)`,
              borderColor: primaryColor
            }}
          >
            <div className="flex items-start gap-8">
              <div 
                className="p-6 rounded-xl shadow-lg"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  border: `2px solid ${primaryColor}30`
                }}
              >
                <FaHeadset className="text-4xl" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1">
                <h3 className="text-4xl font-black text-gray-900 mb-8 leading-tight">
                  We're Here to Help You Succeed
                </h3>
                <div className="text-gray-800 space-y-4 leading-relaxed text-lg">
                  <p className="font-semibold">
                    <strong className="font-black" style={{ color: primaryColor }}>Learning Resources:</strong> Access our comprehensive educational materials, tutorials, and market analysis to enhance your trading knowledge.
                  </p>
                  <p className="font-semibold">
                    <strong className="font-black" style={{ color: primaryColor }}>24/7 Support:</strong> Our dedicated customer service team is available around the clock to assist you with any questions or concerns.
                  </p>
                  <p className="font-semibold">
                    <strong className="font-black" style={{ color: primaryColor }}>Start Small:</strong> Consider beginning with demo trading to familiarize yourself with our platform features before live trading.
                  </p>
                  <p className="font-black text-xl mt-8 p-4 rounded-lg bg-white border-2" style={{ 
                    color: primaryColor,
                    borderColor: `${primaryColor}30`
                  }}>
                    💡 Remember: Successful trading requires continuous learning and risk management. We're committed to supporting your trading journey every step of the way.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-10">
                  <button 
                    className="text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3 border-2 border-white/20 text-lg"
                    style={{ 
                      backgroundColor: primaryColor,
                      background: `linear-gradient(135deg, ${primaryColor}, #1e88e5)`
                    }}
                  >
                    <FaHeadset className="text-lg" />
                    Contact Support
                  </button>
                  <button 
                    className="border-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 text-lg shadow-lg hover:shadow-xl"
                    style={{ 
                      borderColor: primaryColor, 
                      color: primaryColor,
                      backgroundColor: 'white'
                    }}
                  >
                    <FaLightbulb className="text-lg" />
                    Learning Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className="rounded-2xl p-16 text-center text-white shadow-2xl relative overflow-hidden"
            style={{ 
              backgroundColor: primaryColor,
              background: `linear-gradient(135deg, ${primaryColor}, #1e88e5)`
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
            </div>
            
            <h2 className="text-5xl font-black mb-6 relative z-10 drop-shadow-2xl">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-2xl font-semibold mb-10 text-blue-100 max-w-3xl mx-auto relative z-10 leading-relaxed">
              Join thousands of traders who trust our platform for their algorithmic trading needs
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
              <button className="bg-white text-gray-900 px-10 py-5 rounded-xl font-black hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 text-lg border-2 border-white">
                Create Free Account
              </button>
              <button className="border-2 border-white text-white px-10 py-5 rounded-xl font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 text-lg shadow-lg hover:shadow-xl">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}