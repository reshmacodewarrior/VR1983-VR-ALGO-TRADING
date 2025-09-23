import React from 'react';

const TransactionHistory = ({ transactionHistory }) => (
  transactionHistory.length > 0 && (
    <div className="mb-4">
      <h3 className="text-gray-400 text-sm font-medium mb-2">
        Recent Transactions
      </h3>
      <div className="bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
        {transactionHistory
          .slice()
          .reverse()
          .map((transaction, index) => (
            <div
              key={index}
              className={`text-sm ${
                transaction.type === "BUY"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              [{transaction.mode.toUpperCase()}] {transaction.type} {transaction.symbol} at ₹
              {transaction.price !== undefined ? transaction.price.toFixed(2) : "-"} -{" "}
              {typeof transaction.time === "string"
                ? transaction.time
                : new Date(transaction.time).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}

              {transaction.signal && (
                <span className="text-gray-400 text-xs"> - {transaction.signal}</span>
              )}
              <br />
              <span className="text-gray-400 text-xs">
                Order ID: {transaction.orderData?.order_id ?? "N/A"}
              </span>

            </div>
          ))}
      </div>
    </div>
  )
);

export default TransactionHistory;