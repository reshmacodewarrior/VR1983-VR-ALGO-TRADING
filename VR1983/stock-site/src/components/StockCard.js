// import React from "react";

// const StockCard = ({ stock }) => {
//   const isPositive = stock.change >= 0;

//   return (
//     <div className="bg-white shadow-lg rounded-2xl p-4 w-64 transition hover:scale-105 hover:shadow-xl duration-300">
//       {/* Header */}
//       <div className="border-b pb-2 mb-3">
//         <h4 className="text-xl font-semibold text-gray-800">{stock.symbol}</h4>
//       </div>

//       {/* Body */}
//       <div className="flex flex-col gap-2">
//         {/* Price */}
//         <div className="text-2xl font-bold text-gray-900">
//           {stock.currency === "INR" ? "₹" : "$"}
//           {stock.current_price.toFixed(2)}
//         </div>

//         {/* Change */}
//         <div
//           className={`text-sm font-medium ${
//             isPositive ? "text-green-600" : "text-red-600"
//           }`}
//         >
//           {stock.change.toFixed(2)} ({stock.change_percent.toFixed(2)}%)
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StockCard;
