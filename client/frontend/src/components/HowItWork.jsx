import React from "react";

const HowItWorks = () => {
  const steps = [
    { step: "01", title: "Select Meal", desc: "Browse Thalis, Biryanis, or Curries." },
    { step: "02", title: "Freshly Prepared", desc: "Our chefs cook your order fresh." },
    { step: "03", title: "Hot Delivery", desc: "Express delivery to your doorstep." },
  ];

  return (
    <section className="my-16 px-4 max-w-6xl mx-auto text-center">
      <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
        Simple Steps
      </span>
      <h2 className="text-3xl font-extrabold font-serif text-stone-900 mt-3 mb-10">
        How Indian Rasoi Works
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="relative bg-amber-50/30 backdrop-blur-md border border-amber-200/50 rounded-2xl p-6 text-center">
            <span className="font-mono text-3xl font-black text-amber-500/40 block mb-2">
              {s.step}
            </span>
            <h3 className="font-bold text-lg text-stone-900">{s.title}</h3>
            <p className="text-xs text-stone-600 mt-2">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;