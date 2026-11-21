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
  const testimonial = testimonials[index];

  return (
    <section className="mx-auto my-12 w-full max-w-4xl px-1 sm:my-16 sm:px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="mb-3 inline-block rounded-full border border-[#fc8019]/20 bg-[#fc8019]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#b84e00]">
          Customer Stories
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
          What Our Foodies Say
        </h2>
      </div>

      {/* Main Glass Card */}
      <div className="relative rounded-3xl border border-[#d9c4a2] bg-[#f2e7cf] p-5 shadow-sm sm:p-8">
        
        {/* Navigation & Dish Tag Top Row */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <span className="max-w-[65%] rounded-full bg-[#fff3e8] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#9a470b]">
            {testimonials[index].dish}
          </span>

          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="home-icon-button flex h-10 w-10 items-center justify-center rounded-xl border font-bold text-lg shadow-sm transition active:scale-95"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="home-icon-button flex h-10 w-10 items-center justify-center rounded-xl border font-bold text-lg shadow-sm transition active:scale-95"
            >
              ›
            </button>
          </div>
        </div>

        {/* Dynamic Testimonial Display */}
        <div className="min-h-[270px] sm:min-h-[230px]">
          <div key={testimonial.id} className="flex min-h-[270px] flex-col sm:min-h-[230px]">
                {/* Rating Stars */}
                <div className="mb-3 flex gap-1 text-sm text-[#168044]" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <span key={starIndex} aria-hidden="true">★</span>
                  ))}
                </div>

                {/* Review Quote */}
                <p className="text-lg font-medium italic leading-relaxed text-stone-800 sm:text-xl">
                  “{testimonial.text}”
                </p>

                {/* User Bio */}
                <div className="mt-auto flex items-center gap-3 border-t border-[#f0ece7] pt-5">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#f3d7a1]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{testimonial.name}</h4>
                    <p className="text-xs font-medium text-[#68756d]">{testimonial.role}</p>
                  </div>
                </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="mt-5 flex justify-center gap-2 border-t border-[#f0ece7] pt-4">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`home-pagination-dot h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-8" : "w-2"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
