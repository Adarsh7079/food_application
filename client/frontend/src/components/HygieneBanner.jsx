import React from "react";

const HygieneBanner = () => {
  const highlights = [
    { title: "FSSAI Certified", desc: "100% compliance with food safety norms", icon: "🛡️" },
    { title: "Temperature Checks", desc: "Monitored cooking & dispatch", icon: "🌡️" },
    { title: "Zero Preservatives", desc: "Cooked fresh upon every order", icon: "🌿" },
  ];

  return (
    <section className="my-16 px-4 max-w-6xl mx-auto">
      <div className="bg-amber-50/40 backdrop-blur-md border border-amber-200/60 rounded-3xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold font-serif text-stone-900">
            Cooked with Love, Packed with Care
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            We follow strict cloud kitchen hygiene protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-amber-200/40">
              <span className="text-3xl">{h.icon}</span>
              <div>
                <h4 className="font-bold text-sm text-stone-900">{h.title}</h4>
                <p className="text-xs text-stone-500">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HygieneBanner;