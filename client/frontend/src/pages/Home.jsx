import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import LatestCollection from "../components/LatestCollection";
import TiffinService from "../components/TiffinServices";
import HygieneBanner from "../components/HygieneBanner";
import HowItWorks from "../components/HowItWorks";
import OurPolicy from "../components/OurPolicy";
import NewsLetterBox from "../components/NewsLetterBox";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/Faq";
import TiffinOfferHero from "../components/TiffinOfferHero";

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Top Glass Announcement Bar */}
      <div className="relative z-20 bg-[#123d30] text-[#f7f1e7] border-b border-[#2f5d51] px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-2xs">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f3d7a1] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f3d7a1]"></span>
        </span>
        <span>
          <strong className="font-bold text-[#f7dca7]">ZaykaNest is Live!</strong> Enjoy dinner specials & authentic home-style meals delivered piping hot.
        </span>
      </div>
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full " />
      <div className="pointer-events-none absolute right-0 top-40 h-[28rem] w-[28rem] translate-x-1/3 rounded-full" />
      <div className="pointer-events-none absolute left-1/2 top-[40%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full" />
      <div className="pointer-events-none absolute right-1/4 bottom-32 h-[30rem] w-[30rem] rounded-full bg-[#123d30]/10 blur-3xl" />

      <TiffinOfferHero />


      {/* <div className="relative z-10 mt-3 overflow-hidden border-y border-[#123d30]/10 bg-[#123d30] text-[#f8eed8] shadow-inner">
        <div className="flex min-w-max animate-[scroll_18s_linear_infinite] items-center gap-8 whitespace-nowrap px-4 py-2.5 text-xs font-bold uppercase tracking-[0.22em] sm:text-sm">
          <span>Flat 25% Off Orders Above ₹499</span>
          <span className="text-[#f3d7a1]">•</span>
          <span>Free Delivery in 30 Minutes</span>
          <span className="text-[#f3d7a1]">•</span>
          <span>New Combo Meals Every Day</span>
          <span className="text-[#f3d7a1]">•</span>
          <span>Lunch Special ₹199</span>
          <span className="text-[#f3d7a1]">•</span>
          <span>Flat 25% Off Orders Above ₹499</span>
          <span className="text-[#f3d7a1]">•</span>
          <span>Free Delivery in 30 Minutes</span>
          <span className="text-[#f3d7a1]">•</span>
          <span>New Combo Meals Every Day</span>
          <span className="text-[#f3d7a1]">•</span>
          <span>Lunch Special ₹199</span>
        </div>
      </div> */}

      {/* Hero Header */}
      <header className="relative pt-6 pb-8">
        <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <Hero /> 
        </div>
      </header>

      {/* Main Page Content */}
      <main className="relative z-10 pb-20 space-y-14 sm:space-y-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-20">
                 {/* Menu Preview */}
          <section>
            <LatestCollection />
          </section>

          {/* Categories Section */}
          <section>
            <Categories />
          </section>

          {/* Tiffin / Subscription Services */}
          <section>
            <TiffinService />
          </section>

          {/* Kitchen Hygiene & Safety Banner */}
          <section>
          <HygieneBanner/>
          </section>

          {/* How Ordering Works */}
          {/* <section>
            <HowItWorks />
          </section> */}

          {/* Value Pillars (Fast Delivery, Good Quality, Good Quantity) */}
          <section>
            <OurPolicy />
          </section>

          {/* Customer Testimonials Carousel */}
          <section>
            <Testimonials />
          </section>

          {/* FAQs */}
          <section>
            <FAQ />
          </section>

          {/* Newsletter Subscription */}
          <section>
            <NewsLetterBox />
          </section>

        </div>
      </main>
    </div>
  );
};

export default Home;
