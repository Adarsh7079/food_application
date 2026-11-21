import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import LatestCollection from "../components/LatestCollection";
import TiffinService from "../components/TiffinServices";
import HygieneBanner from "../components/HygieneBanner";
import OurPolicy from "../components/OurPolicy";
import NewsLetterBox from "../components/NewsLetterBox";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/Faq";

const Home = () => {
  return (
    <div className="relative left-1/2 min-h-screen w-screen -translate-x-1/2">
      <div className="flex items-center justify-center gap-2 border-b border-[#2f5d51] bg-[#123d30] px-4 py-2.5 text-center text-xs font-medium text-[#f7f1e7] sm:text-sm">
        <span className="h-2 w-2 rounded-full bg-[#f3d7a1]" aria-hidden="true" />
        <span><strong className="font-bold text-[#f7dca7]">ZaykaNest is live in Gurugram.</strong> Fresh, homestyle meals delivered to your door.</span>
      </div>

      <header className="pt-5 sm:pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Hero />
        </div>
      </header>

      <main className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-14 sm:px-6 lg:px-8">
          <section>
            <LatestCollection />
          </section>

          <section>
            <Categories />
          </section>

          <section>
            <TiffinService />
          </section>

          <section>
            <HygieneBanner />
          </section>

          <section>
            <OurPolicy />
          </section>

          <section>
            <Testimonials />
          </section>

          <section>
            <FAQ />
          </section>

          {/* <section>
            <NewsLetterBox />
          </section> */}
        </div>
      </main>
    </div>
  );
};

export default Home;
