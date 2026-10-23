import React, { useState } from "react";

const faqs = [
  { q: "What are your delivery hours?", a: "We operate from 11:00 AM to 11:30 PM every day." },
  { q: "Do you offer pure vegetarian options?", a: "Yes! We have dedicated separate veg and non-veg preparation units." },
  { q: "Can I customize spice levels in my dish?", a: "Absolutly! You can mention your spice preferences in the order notes." },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);

  return (
    <section className="my-16 px-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold font-serif text-center text-stone-900 mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex justify-between items-center font-bold text-sm text-stone-900">
              <span>{f.q}</span>
              <span>{open === i ? "−" : "+"}</span>
            </div>
            {open === i && <p className="text-xs text-stone-600 mt-2 leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;