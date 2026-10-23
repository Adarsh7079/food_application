import React from "react";
import uttapam from "../assets/uttapam.png"; // Placeholder image for the hero section
import { foodCategories, foodItemsByCategory } from "../data/defaultIndianFoodItems";
const Hero = () => {
  const categories = foodCategories.slice(0, 4).map((name) => ({
    name,
    image: foodItemsByCategory[name][0]?.image?.[0],
  }));

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-[#f7f1e7] backdrop-blur-md border border-[#d9c4a2] p-6 sm:p-10 lg:p-12 shadow-lg">
      {/* Background Soft Glow */}
      <div className="absolute -right-8 top-10 h-64 w-64 rounded-full bg-[#d9a74a]/15 blur-3xl pointer-events-none" />

      {/* Main Grid */}
      <div className="relative grid gap-8 lg:grid-cols-2 items-center">
        {/* Left Side Content */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ZaykaNest"
              className="h-16 w-16 rounded-full object-cover shadow-sm"
            />
            <span className="inline-flex items-center rounded-full bg-[#123d30]/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#123d30] border border-[#123d30]/20">
              Cloud Kitchen • ZaykaNest
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1c2b20] leading-tight font-serif">
            Authentic  Indian Food at{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#123d30] via-[#2d6756] to-[#d9a74a]">
              ZaykaNest
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-stone-700 font-medium">
            Just a click away when you crave rich North Indian flavors. From butter-loaded naans and rich paneer curries to fresh Rasgullas and thalis, enjoy home-style recipes delivered piping hot.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/menu"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#123d30] to-[#2d6756] hover:from-[#0d2d22] hover:to-[#1d4d3e] active:scale-95 px-8 py-3.5 text-sm font-bold text-[#f7f1e7] shadow-md transition-all duration-200"
            >
              Order Now
            </a>
            <a
              href="/menu"
              className="inline-flex items-center justify-center rounded-2xl border border-[#123d30]/30 bg-[#f3d7a1]/40 hover:bg-[#f3d7a1]/60 backdrop-blur-md px-8 py-3.5 text-sm font-bold text-[#123d30] transition-all duration-200"
            >
              View Menu
            </a>
          </div>

          {/* Highlights Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#f3d7a1]/20 backdrop-blur-md p-4 border border-[#d9a74a]/40 shadow-2xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800">
              <span className="rounded-xl bg-[#d9a74a]/20 p-2 text-[#123d30]">🫓</span>
              Fresh Tandoori
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800">
              <span className="rounded-xl bg-[#d9a74a]/20 p-2 text-[#123d30]">🚀</span>
              Fast Delivery
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800">
              <span className="rounded-xl bg-[#d9a74a]/20 p-2 text-[#123d30]">🏡</span>
              Ghar Jaisa Swad
            </div>
          </div>
        </div>

        {/* Right Side Main Hero Image */}
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#f3d7a1]/20 backdrop-blur-md p-3 border border-[#d9a74a]/40 shadow-md group">
            <img
              src={uttapam}
              alt="Maa Ka Rasoi North Indian Thali"
              className="w-full h-74 sm:h-110 object-cover rounded-2xl group-hover:scale-102 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 border-t border-[#d9a74a]/30 pt-8">
        <div className="grid gap-6 lg:grid-cols-3 items-center">

          {/* Best Delivered Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-stone-900 mb-6 font-serif">
              North Indian Specialties
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div key={cat.name} className="flex flex-col items-center group cursor-pointer text-center">
                  <div className="w-20 h-20 rounded-full bg-[#f3d7a1]/25 p-1 backdrop-blur-md border border-[#d9a74a]/60 shadow-sm transition transform group-hover:scale-108 group-hover:border-[#d9a74a]">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="mt-2 text-xs sm:text-sm font-bold text-stone-800 group-hover:text-[#123d30] transition-colors">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Opening Offer Card */}
          <div className="rounded-2xl border border-[#d9a74a]/40 bg-gradient-to-br from-[#f3d7a1]/35 via-[#f7f1e7]/40 to-[#d9a74a]/20 backdrop-blur-md p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#123d30] bg-[#f3d7a1]/60 px-2.5 py-1 rounded-md border border-[#d9a74a]/50">
              Opening Offer
            </span>
            <p className="mt-2 text-lg font-bold text-stone-900">
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
