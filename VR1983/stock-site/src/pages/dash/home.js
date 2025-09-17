import React, { useState, useEffect } from "react";
import img1 from "../../asset/carousal-1.jpg";
import img2 from "../../asset/carousal-2.jpg";
import img3 from "../../asset/carousal-3.jpg";
import img4 from "../../asset/carousal-4.jpg";

const images = [
  { src: img1, title: "Immersive Trading Experience", description: "Step into the future of algorithmic trading platform" },
  { src: img2, title: "Real-time Market Analytics", description: "Visualize market trends and patterns in 3D environments" },
  { src: img3, title: "Advanced Algorithm Builder", description: "Create and test trading algorithms in virtual reality" },
  { src: img4, title: "Multi-device Compatibility", description: "Trade seamlessly across VR, desktop, and mobile platforms" }
];

export default function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        handleNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransitioning]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  return (
    <div className="relative w-full mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900">
      {/* Carousel Container */}
      <div className="relative h-screen max-h-[800px] overflow-hidden">
        {/* Slide with content */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentIndex
                ? "opacity-100 translate-x-0"
                : index < currentIndex
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/50"></div>
            
            {/* Text content - moved higher up */}
            <div className={`absolute top-1/3 left-10 text-white transition-all duration-1000 delay-300 ${
              index === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
              <h2 className="text-5xl font-bold mb-4">{image.title}</h2>
              <p className="text-2xl max-w-2xl">{image.description}</p>
            </div>
          </div>
        ))}

        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-blue-800/70 hover:bg-blue-700 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
          aria-label="Previous slide"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-blue-800/70 hover:bg-blue-700 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
          aria-label="Next slide"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? "bg-blue-400 scale-125" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}