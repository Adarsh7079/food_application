import React from "react";
import uttapam from "../assets/uttapam.png";
import { foodCategories, foodItemsByCategory } from "../data/defaultIndianFoodItems";
const Hero = () => {
  const categories = foodCategories.slice(0, 4).map((name) => ({
    name,
    image: foodItemsByCategory[name][0]?.image?.[0],
  }));

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#d9c4a2] bg-[#f2e7cf] p-5 shadow-sm sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-8 top-10 h-64 w-64 rounded-full bg-[#fc8019]/10 blur-3xl" />

      {/* Main Grid */}
      <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Side Content */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-[#fc8019]/20 bg-[#fc8019]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#b84e00]">
              Gurugram's home-style kitchen
            </span>
          </div>

          <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#1c2b20] sm:text-4xl lg:text-5xl">
            Craving something{" "}
            <span className="text-[#fc8019]">delicious?</span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-[#68756d] sm:text-base">
            Discover fresh, comforting Indian meals made with care. From breakfast favourites to hearty thalis, find your next delicious bite at ZaykaNest.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="/menu"
              className="home-primary-button inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-sm font-bold shadow-md transition-all duration-200 active:scale-95"
            >
              Order Now
            </a>
            <a
              href="/menu"
              className="home-secondary-button inline-flex items-center justify-center rounded-2xl border px-8 py-3.5 text-sm font-bold transition-all duration-200"
            >
              View Menu
            </a>
          </div>

          {/* Highlights Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800">
              <span className="rounded-lg bg-[#f7f5f2] px-3 py-2 text-[#123d30]">Freshly prepared</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800">
              <span className="rounded-lg bg-[#f7f5f2] px-3 py-2 text-[#123d30]">Made with care</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800">
              <span className="rounded-lg bg-[#f7f5f2] px-3 py-2 text-[#123d30]">Delivered to you</span>
            </div>
          </div>
        </div>

        {/* Right Side Main Hero Image */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#f7f5f2] p-2">
            <img
              src={uttapam}
              alt="Maa Ka Rasoi North Indian Thali"
              className="h-64 w-full rounded-2xl object-cover sm:h-80"
            />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 border-t border-[#f0ece7] pt-6 sm:mt-10 sm:pt-8">
        <div className="grid gap-6 lg:grid-cols-3 items-center">

          {/* Best Delivered Categories */}
          <div className="lg:col-span-2">
            <h2 className="mb-5 text-lg font-bold text-stone-900 sm:text-xl">
              What are you craving?
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((cat) => (
                <div key={cat.name} className="flex flex-col items-center group cursor-pointer text-center">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-[#f7f5f2] transition group-hover:scale-105 sm:h-20 sm:w-20">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="mt-2 text-xs font-semibold text-stone-700 transition-colors group-hover:text-[#b84e00] sm:text-sm">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Opening Offer Card */}
          <div className="rounded-2xl border border-[#f7d8bb] bg-[#fff7ef] p-5">
            <span className="rounded-md bg-[#f6eedb] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#b84e00]">
              Opening Offer
            </span>
            <p className="mt-3 text-lg font-bold text-stone-900">
              25% OFF on your first order
            </p>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              Free delivery on orders above ₹499.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
