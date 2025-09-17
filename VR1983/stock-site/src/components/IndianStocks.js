// import React, { useState, useEffect } from 'react';
// import { stockAPI } from '../services/api';
// import StockCard from './StockCard';

// const IndianStocks = ({ period, interval }) => {
//   const [stocks, setStocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     loadIndianStocks();
//   }, [period, interval]);

//   const loadIndianStocks = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await stockAPI.getIndianStocks(20, period, interval);
//       setStocks(data);
//     } catch (error) {
//       setError('Failed to load Indian stocks data');
//       console.error('Error loading Indian stocks:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl shadow-xl text-white">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
//         <p className="text-lg font-semibold">Loading Indian Market...</p>
//         <p className="text-blue-300 text-sm">Analyzing top performers</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-900 text-white shadow-xl rounded-2xl border border-gray-700 text-center">
//         <div className="text-red-400 text-4xl mb-3">⚠️</div>
//         <h3 className="text-xl font-semibold mb-2">{error}</h3>
//         <button
//           onClick={loadIndianStocks}
//           className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-900 text-white shadow-xl rounded-2xl border border-gray-700">
//       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
//         <div>
//           <h2 className="text-2xl font-bold mb-1">🇮🇳 Indian Stock Market</h2>
//           <p className="text-blue-300">Top performing stocks in the Indian market</p>
//         </div>
        
//         <button
//           onClick={loadIndianStocks}
//           className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-2"
//         >
//           <span>🔄</span>
//           Refresh
//         </button>
//       </div>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//         {stocks.map((stock) => (
//           <StockCard key={stock.symbol} stock={stock} currency="INR" />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default IndianStocks;