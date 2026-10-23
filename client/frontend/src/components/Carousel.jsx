import React, { useEffect, useRef, useState } from "react";

const Carousel = ({ slides = [], interval = 4500 }) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const start = () => {
    stop();
    timerRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, interval);
  };

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const goTo = (i) => {
    setIndex(i % slides.length);
  };

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <div className="w-full h-[360px] sm:h-[420px] md:h-[480px] relative">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          >
            <img
              src={s.image}
              alt={s.title || `slide-${i}`}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute left-6 bottom-8 max-w-xl bg-white/70 backdrop-blur-sm p-5 rounded-lg transition-all duration-700 transform ${
                i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h2 className="text-2xl font-semibold text-gray-900">{s.title}</h2>
              {s.subtitle && (
                <p className="mt-2 text-sm text-gray-700">{s.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white z-30"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white z-30"
      >
        ›
      </button>

      {/* dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 w-8 rounded-full transition-all ${
              i === index ? "bg-orange-600 w-10" : "bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
