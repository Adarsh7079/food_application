import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const foodSlides = [
  {
    id: 1,
    eyebrow: "ZAYKANEST SPECIAL",
    title: "Homemade Food, Made with Love",
    description:
      "Enjoy delicious Indian meals prepared fresh for your everyday cravings. Experience the comforting taste of homemade food.",
    image: "/food/sabji_roti.png",
    features: ["Freshly Prepared", "Authentic Indian Taste", "Made with Love"],
    buttonText: "Explore Our Menu",
    prepTime: "20-25 mins",
    calories: "450 kcal",
    rating: "4.9 ★",
  },
  {
    id: 2,
    eyebrow: "MONTHLY TIFFIN PLAN",
    title: "30 Meals for Just ₹2500",
    description:
      "Skip the daily cooking hassle and enjoy convenient, home-style meals with our affordable monthly tiffin service.",
    image: "/food/bhindi_roti.png",
    features: ["30 Tiffins", "Only ₹83 Per Tiffin", "Everyday Convenience"],
    buttonText: "View Tiffin Plans",
    prepTime: "Scheduled Delivery",
    calories: "Homestyle Balanced",
    rating: "5.0 ★",
  },
  {
    id: 3,
    eyebrow: "FRESH & DELICIOUS",
    title: "Your Everyday Food Partner",
    description:
      "From delicious sabji and roti to comforting rice meals, find something tasty for every day at ZaykaNest.",
    image: "/food/rice.png",
    features: ["Homestyle Meals", "Affordable Options", "Indian Favorites"],
    buttonText: "Order Your Meal",
    prepTime: "15-20 mins",
    calories: "520 kcal",
    rating: "4.8 ★",
  },
  {
    id: 4,
    eyebrow: "SATISFY YOUR CRAVINGS",
    title: "Good Food. Great Mood.",
    description:
      "Craving something delicious? Explore our menu and discover tasty meals prepared to make your day better.",
    image: "/food/samosa.png",
    features: ["Tasty Snacks", "Fresh Ingredients", "Something for Everyone"],
    buttonText: "Discover Our Menu",
    prepTime: "10-15 mins",
    calories: "320 kcal",
    rating: "4.9 ★",
  },
];

const FoodCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [, setDirection] = useState(1);
  const [hoveredDot, setHoveredDot] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const touchStartX = useRef(0);
  const AUTOPLAY_DURATION = 5000;

  const changeSlide = (step) => {
    setDirection(step);
    setActiveSlide(
      (current) => (current + step + foodSlides.length) % foodSlides.length
    );
  };

  // Keyboard Navigation
  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      changeSlide(-1);
    } else if (event.key === "ArrowRight") {
      changeSlide(1);
    }
  };

  // Parallax / Hover Movement
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  useEffect(() => {
    if (paused) return undefined;

    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveSlide((current) => (current + 1) % foodSlides.length);
    }, AUTOPLAY_DURATION);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      className="group relative h-100 mx-auto my-5 w-[94%] max-w-7xl overflow-hidden rounded-3xl bg-[#123d30] shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#f3d7a1]"
      aria-label="ZaykaNest food carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        const difference =
          touchStartX.current - event.changedTouches[0].clientX;

        if (Math.abs(difference) > 50) {
          changeSlide(difference > 0 ? 1 : -1);
        }
      }}
    >
      {/* Animated Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
        <div
          key={activeSlide + (paused ? "-paused" : "-active")}
          className="h-full bg-[#f3d7a1] transition-all"
          style={{
            animation: !paused
              ? `carouselProgress ${AUTOPLAY_DURATION}ms linear forwards`
              : "none",
            width: paused ? "100%" : "0%",
          }}
        />
      </div>

      {/* Sliding track */}
      <div
        className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{
          transform: `translateX(-${activeSlide * 100}%)`,
        }}
      >
        {foodSlides.map((slide) => (
          <article
            key={slide.id}
            className="relative min-w-full overflow-hidden"
            aria-label={slide.title}
            aria-hidden={foodSlides[activeSlide].id !== slide.id}
          >
            {/* Background image with subtle parallax scaling */}
            <div
              className="absolute inset-0 h-full w-full transition-transform duration-300 ease-out"
              style={{
                transform: `scale(1.05) translate(${mousePos.x * -12}px, ${
                  mousePos.y * -12
                }px)`,
              }}
            >
              <img
                src={slide.image}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#102c22]/95 via-[#123d30]/85 to-[#123d30]/40" />

            {/* Interactive Dish Info Badge (Top Right) */}
            <div className="absolute top-6 right-6 z-20 hidden md:flex items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-4 py-2.5 backdrop-blur-md text-white shadow-xl">
              <span className="text-xs font-semibold text-[#f3d7a1]">
                {slide.rating}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs font-medium text-white/90">
                ⏱ {slide.prepTime}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs font-medium text-white/90">
                🔥 {slide.calories}
              </span>
            </div>

            {/* Slide content */}
            <div className="relative z-10 flex min-h-[460px] items-center px-7 py-16 sm:min-h-[480px] sm:px-14 lg:min-h-[520px] lg:px-16">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-[#f3d7a1]/50 bg-[#f3d7a1]/15 px-4 py-2 text-xs font-bold tracking-[0.2em] text-[#f3d7a1] sm:text-sm shadow-sm transition hover:scale-105">
                  {slide.eyebrow}
                </span>

                <p className="mt-6 text-sm font-semibold text-[#f3d7a1] sm:text-base">
                  Welcome to ZaykaNest ❤️
                </p>

                <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                  {slide.title}
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-white/85 sm:text-base lg:text-lg">
                  {slide.description}
                </p>

                {/* Features */}
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                  {slide.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-[#f3d7a1] backdrop-blur-sm sm:text-sm"
                    >
                      <span className="text-emerald-400">✓</span> {feature}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/menu"
                    tabIndex={foodSlides[activeSlide].id === slide.id ? 0 : -1}
                    className="group/btn inline-flex items-center gap-2 rounded-xl bg-[#f3d7a1] px-6 py-3.5 text-sm font-bold text-[#123d30] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl sm:text-base"
                  >
                    <span>{slide.buttonText}</span>
                    <span className="transition-transform group-hover/btn:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/menu"
                    tabIndex={foodSlides[activeSlide].id === slide.id ? 0 : -1}
                    className="rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/20 sm:text-base"
                  >
                    View All Dishes
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Previous button */}
      <button
        type="button"
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-xl text-white backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-black/70 sm:left-5 sm:h-12 sm:w-12"
      >
        &#8592;
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-xl text-white backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-black/70 sm:right-5 sm:h-12 sm:w-12"
      >
        &#8594;
      </button>

      {/* Interactive Dot Indicators with Live Hover Cards */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {foodSlides.map((slide, index) => (
          <div key={slide.id} className="relative">
            {/* Hover Thumbnail Popup Card */}
            {hoveredDot === index && (
              <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 w-32 rounded-xl border border-white/20 bg-[#102c22]/95 p-2 text-center shadow-xl backdrop-blur-md pointer-events-none transition-all">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-14 w-full rounded-lg object-cover mb-1"
                />
                <p className="truncate text-[10px] font-bold text-[#f3d7a1]">
                  {slide.title}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setDirection(index > activeSlide ? 1 : -1);
                setActiveSlide(index);
              }}
              onMouseEnter={() => setHoveredDot(index)}
              onMouseLeave={() => setHoveredDot(null)}
              aria-label={`Show slide ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeSlide === index
                  ? "w-8 bg-[#f3d7a1]"
                  : "w-2.5 bg-white/50 hover:bg-white hover:scale-125"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Progress Bar Animation Keyframe Style */}
      <style>{`
        @keyframes carouselProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default FoodCarousel;
