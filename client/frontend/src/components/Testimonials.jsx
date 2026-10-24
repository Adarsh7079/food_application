import React, { useEffect, useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Asha Parikh",
    role: "Verified Foodie",
    rating: 5,
    dish: "Special Paneer Thali",
    text: "The Paneer Thali felt like genuine home-cooked comfort food. The Dal Makhani was creamy and delivered piping hot!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    role: "Regular Customer",
    rating: 5,
    dish: "Hyderabadi Dum Biryani",
    text: "Generous portions and aromatic spices! The Biryani Pot deal is incredible value for weekend family dinners.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 3,
    name: "Maya Rawat",
    role: "Local Localite",
    rating: 5,
    dish: "Gulab Jamun & Kheer",
    text: "Authentic North Indian sweets! Soft, hot Gulab Jamuns and rich Shahi Kheer—felt like a true festival feast.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((current) => (current + 1) % testimonials.length);

  return (
    <section className="my-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-500/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/20 shadow-xs mb-3">
          Customer Stories
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif">
          What Our Foodies Say
        </h2>
      </div>

      {/* Main Glass Card */}
      <div className="relative bg-amber-50/40 backdrop-blur-md border border-amber-200/60 rounded-3xl p-6 sm:p-10 shadow-lg overflow-hidden">
        
        {/* Navigation & Dish Tag Top Row */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 backdrop-blur-xs px-3 py-1 rounded-full border border-amber-300/50">
            {testimonials[index].dish}
          </span>

          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-800 border border-amber-500/20 backdrop-blur-md flex items-center justify-center font-bold text-lg transition-all shadow-2xs"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-800 border border-amber-500/20 backdrop-blur-md flex items-center justify-center font-bold text-lg transition-all shadow-2xs"
            >
              ›
            </button>
          </div>
        </div>

        {/* Dynamic Testimonial Display */}
        <div className="relative min-h-[160px] sm:min-h-[140px] flex items-center">
          {testimonials.map((t, i) => {
            const isActive = i === index;
            return (
              <div
                key={t.id}
                className={`absolute inset-0 flex flex-col justify-between transition-all duration-500 ${
                  isActive
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-x-6 pointer-events-none"
                }`}
              >
                {/* Rating Stars */}
                <div className="flex gap-1 text-green-600 text-sm mb-3">
                  {[...Array(t.rating)].map((_, starIndex) => (
                    <span key={starIndex}>★</span>
                  ))}
                </div>

                {/* Review Quote */}
                <p className="text-lg sm:text-xl font-medium text-stone-800 leading-relaxed font-serif italic">
                  “{t.text}”
                </p>

                {/* User Bio */}
                <div className="mt-6 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/80 shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{t.name}</h4>
                    <p className="text-xs text-amber-800/80 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators */}
        <div className="mt-8 pt-4 border-t border-amber-200/40 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 w-8"
                  : "bg-amber-300/50 hover:bg-amber-400/60 w-2"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
