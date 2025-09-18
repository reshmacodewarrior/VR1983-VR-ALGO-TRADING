import React from 'react';

const OrderExecution = ({ executingOrder }) => (
  executingOrder && (
    <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
      executingOrder.type === "BUY" ? "bg-blue-900 text-blue-200" :
      executingOrder.type === "SELL" ? "bg-blue-900 text-blue-200" :
      "bg-blue-900 text-blue-200"
    }`}>
      <strong>EXECUTING {executingOrder.type} ORDER:</strong> {executingOrder.message}
    </div>
  )
);

export default OrderExecution;