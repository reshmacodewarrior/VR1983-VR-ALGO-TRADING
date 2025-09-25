import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

const Celebration = ({ trigger }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000); //
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full flex justify-center z-50">
      {/* 🎉 popup message */}
      <div className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-full shadow-lg flex items-center gap-2">
        <span className="text-2xl">🎉</span>
        <span>{trigger}</span>
      </div>

      {/* 🎊 confetti shower */}
      <Confetti width={window.innerWidth} height={window.innerHeight} />
    </div>
  );
};

export default Celebration;
