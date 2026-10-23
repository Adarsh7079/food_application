import React from "react";

const TiffinService = () => {
  return (
    <section className="my-16 px-4 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-[#d9a74a]/30 bg-linear-to-r from-[#123d30] via-[#0d2d22] to-[#1d4d3e] p-8 text-[#f8eed8] shadow-xl sm:p-12">
        <div className="relative z-10 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f3d7a1] bg-[#f3d7a1]/10 border border-[#f3d7a1]/30 px-3.5 py-1 rounded-full">
            Daily Tiffin Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif mt-4 text-[#f8eed8]">
            Ghar Ka Khaana, Delivered Daily.
          </h2>
          <p className="mt-3 text-[#ebddc1] text-sm sm:text-base leading-relaxed">
            Subscribe to our weekly or monthly meal plans. Fresh, hygienic, and home-style cooked North & South Indian meals delivered right to your office or home.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <button className="bg-linear-to-r from-[#d9a74a] to-[#f3d7a1] hover:from-[#c78c28] hover:to-[#ebc97c] text-[#123d30] font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95">
              Explore Meal Plans
            </button>
            <span className="text-xs font-semibold text-[#f3d7a1]">
              ₹2600 · 30 tiffins · approx. ₹87 per meal
            </span>
          </div>
        </div>
        
        {/* Decorative Badge */}
        <div className="hidden md:flex absolute -right-6 -bottom-6 w-72 h-72 rounded-full bg-[#d9a74a]/10 border border-[#f3d7a1]/20 backdrop-blur-md items-center justify-center p-8 text-center">
          <div className="text-[#f8eed8]">
            <span className="text-4xl font-extrabold block">100%</span>
            <span className="text-xs uppercase font-bold tracking-wider">Hygienic & Fresh</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TiffinService;