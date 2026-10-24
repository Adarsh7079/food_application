import React from "react";
import { assets } from "../assets/assets";

const policies = [
  {
    id: 1,
    title: "Fast Delivery",
    desc: "Piping hot food delivered straight to your doorstep in record time.",
    icon: assets?.exchange_icon,
    fallbackEmoji: "⚡",
  },
  {
    id: 2,
    title: "Good Quality",
    desc: "Authentic recipes prepared with 100% fresh ingredients & spices.",
    icon: assets?.quality_icon,
    fallbackEmoji: "🌟",
  },
  {
    id: 3,
    title: "Good Quantity",
    desc: "Generous portion sizes designed to satisfy your appetite completely.",
    icon: assets?.support_img,
    fallbackEmoji: "🍱",
  },
];

const OurPolicy = () => {
  return (
    <section className="my-16 px-4 max-w-6xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-3">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="group bg-[#f7f1e7] backdrop-blur-md border border-[#d9c4a2] hover:border-[#123d30]/50 rounded-3xl p-6 sm:p-8 text-center shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-between"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#123d30]/10 border border-[#123d30]/20 backdrop-blur-xs flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
              {policy.icon ? (
                <img
                  src={policy.icon}
                  className="w-8 h-8 object-contain"
                  alt={policy.title}
                />
              ) : (
                <span className="text-2xl">{policy.fallbackEmoji}</span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-lg text-stone-900 tracking-tight">
                {policy.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {policy.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurPolicy;