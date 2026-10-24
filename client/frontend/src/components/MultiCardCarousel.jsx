import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";

const MultiCardCarousel = ({ items = [], interval = 3500 }) => {
  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisible(3);
      else if (w >= 640) setVisible(3);
      else setVisible(1);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const itemWidth = 100 / visible;
  const maxIndex = Math.max(items.length - visible, 0);

  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [index, maxIndex]);

  useEffect(() => {
    if (paused || maxIndex === 0) return;
    const t = setInterval(
      () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
      interval
    );
    return () => clearInterval(t);
  }, [paused, interval, maxIndex]);

  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${index * itemWidth}%)` }}
        >
          {items.map((item) => (
            <div
              key={item._id || item.id}
              className="flex-shrink-0 px-2"
              style={{ flexBasis: `${itemWidth}%` }}
            >
              <ProductItem
                id={item._id || item.id}
                image={item.image}
                name={item.name}
                price={item.price}
                description={item.description}
                rating={item.rating}
              />
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      {maxIndex > 0 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
          >
            ›
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 w-8 rounded-full ${i === index ? "bg-orange-500" : "bg-gray-300"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MultiCardCarousel;
