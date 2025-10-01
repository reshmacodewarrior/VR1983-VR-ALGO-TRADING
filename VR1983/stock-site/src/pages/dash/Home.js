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
        
        {/* Light Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/40"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="ml-16 max-w-2xl text-gray-900">
            <div className="mb-6">
              <span 
                className="text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block"
                style={{ backgroundColor: primaryColor }}
              >
                🚀 NEXT GENERATION PLATFORM
              </span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Immersive
              <br />
              <span style={{ color: primaryColor }}>
                Algorithmic Trading
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Step into the future of trading with our cutting-edge platform. 
              Experience real-time market data with advanced algorithmic strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
                style={{ backgroundColor: primaryColor }}
              >
                Start Trading Now
                <FaArrowRight className="text-sm" />
              </button>
              <button 
                className="border-2 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Watch Demo
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>$2.4B+</div>
                <div className="text-gray-600 text-sm">Daily Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>50K+</div>
                <div className="text-gray-600 text-sm">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>150+</div>
                <div className="text-gray-600 text-sm">Markets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ color: primaryColor }}>
          <div className="text-center">
            <div className="text-sm mb-2">Explore More</div>
            <div className="w-6 h-10 border-2 rounded-full flex justify-center" style={{ borderColor: primaryColor }}>
              <div className="w-1 h-3 rounded-full mt-2" style={{ backgroundColor: primaryColor }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-b border-gray-200 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2" style={{ color: primaryColor }}>{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the next generation of algorithmic trading with cutting-edge technology and unparalleled performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group"
              >
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-xl p-6 h-full border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-blue-300`}>
                  <div 
                    className="rounded-lg w-14 h-14 flex items-center justify-center shadow-sm mb-6 group-hover:shadow-md transition-shadow border"
                    style={{ 
                      backgroundColor: 'white',
                      borderColor: primaryColor,
                      color: primaryColor
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                  <div className="text-sm font-semibold" style={{ color: primaryColor }}>{feature.stats}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trading Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trading Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access our comprehensive suite of trading tools across all platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tradingFeatures.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-xl p-6 h-full border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl mb-4 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  
                  {/* Feature list */}
                  <div className="space-y-2 mb-4">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        ></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    feature.status === "Active" || feature.status === "Live"
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
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
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className="rounded-xl p-8 border"
            style={{ 
              background: `linear-gradient(to right, ${primaryColor}20, ${primaryColor}10)`,
              borderColor: primaryColor
            }}
          >
            <div className="flex items-start gap-6">
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <FaHeadset className="text-3xl" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">We're Here to Help You Succeed</h3>
                <div className="text-gray-700 space-y-3 leading-relaxed">
                  <p>
                    <strong>Learning Resources:</strong> Access our comprehensive educational materials, tutorials, and market analysis to enhance your trading knowledge.
                  </p>
                  <p>
                    <strong>24/7 Support:</strong> Our dedicated customer service team is available around the clock to assist you with any questions or concerns.
                  </p>
                  <p>
                    <strong>Start Small:</strong> Consider beginning with demo trading to familiarize yourself with our platform features before live trading.
                  </p>
                  <p className="font-medium mt-4" style={{ color: primaryColor }}>
                    Remember: Successful trading requires continuous learning and risk management. We're committed to supporting your trading journey every step of the way.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-6">
                  <button 
                    className="text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <FaHeadset className="text-sm" />
                    Contact Support
                  </button>
                  <button 
                    className="border px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                    style={{ 
                      borderColor: primaryColor, 
                      color: primaryColor 
                    }}
                  >
                    <FaLightbulb className="text-sm" />
                    Learning Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className="rounded-xl p-12 text-center text-white shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Trading Journey?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of traders who trust our platform for their algorithmic trading needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                Create Free Account
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}