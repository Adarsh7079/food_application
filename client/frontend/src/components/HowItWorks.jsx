import React from "react";

const steps = [
  { id: 1, title: "Choose your dish", desc: "Browse the menu and pick your favorites." },
  { id: 2, title: "We cook fresh", desc: "Prepared fresh to order by our kitchen." },
  { id: 3, title: "Delivered hot", desc: "Hot and fast delivery to your doorstep." },
];

const HowItWorks = () => {
  return (
    <div className="my-16">
      <div className="text-center">
        <h3 className="text-3xl font-semibold">How it works</h3>
        <p className="mt-2 text-sm text-gray-600">Simple steps from order to plate.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.id} className="p-6 rounded-2xl bg-white border border-orange-50 shadow-sm text-center">
            <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-full bg-orange-50 text-orange-600 font-bold">{s.id}</div>
            <h4 className="mt-4 font-semibold text-gray-800">{s.title}</h4>
            <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
