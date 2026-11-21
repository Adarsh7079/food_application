import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContextContext";
import { Link } from "react-router-dom";
import MultiCardCarousel from "./MultiCardCarousel";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 8));
  }, [products]);

  return (
    <div className="relative">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#b84e00]">Freshly prepared</span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#202124] sm:text-3xl">
            Top picks for you
          </h2>
          <p className="mt-1 text-sm text-[#68756d]">
            Crowd favourites, made fresh and delivered with care.
          </p>
        </div>
        <Link
          to="/menu"
          className="home-secondary-button hidden rounded-full border px-4 py-2 text-sm font-semibold transition sm:inline-flex"
        >
          View all
        </Link>
      </div>

      <div className="relative">
        <MultiCardCarousel items={latestProducts} interval={4000} />
      </div>

      <div className="relative mt-6 flex flex-wrap justify-center gap-3 sm:hidden">
        <Link
          to="/menu"
          className="home-secondary-button inline-flex rounded-full border px-5 py-3 text-sm font-bold transition"
        >
          View full menu
        </Link>
      </div>
    </div>
  );
};

export default LatestCollection;
