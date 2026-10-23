import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContextContext";
import { Link } from "react-router-dom";
import Title from "./Title";
import MultiCardCarousel from "./MultiCardCarousel";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 8));
  }, [products]);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[#d9c4a2] bg-gradient-to-br from-[#f9f3e9] via-[#f4e7d1] to-[#f0ecdf] p-5 shadow-[0_24px_60px_-42px_rgba(18,61,48,0.38)] sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#d9a74a]/20 blur-3xl" />
      <div className="relative text-center">
        <span className="inline-flex rounded-full bg-[#123d30] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5e7c8] ring-1 ring-[#2d6756]">
          Freshly prepared
        </span>
        <div className="mt-3"><Title text1={"ZAYKANEST"} text2={"MENU"} /></div>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#3d4b3e] sm:text-base">
          Explore a selection of fresh, flavourful dishes from ZaykaNest.
        </p>
      </div>

      <div className="relative mt-7">
        <MultiCardCarousel items={latestProducts} interval={4000} />
      </div>

      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/menu"
          className="inline-flex rounded-full border border-[#123d30]/25 bg-[#fffaf2] px-6 py-3 text-sm font-bold text-[#123d30] transition hover:border-[#123d30] hover:bg-[#f3d7a1]/30"
        >
          View full menu
        </Link>
        <Link
          to="/cart"
          className="inline-flex rounded-full bg-gradient-to-r from-[#123d30] to-[#2d6756] px-6 py-3 text-sm font-bold text-[#f7f1e7] shadow-md shadow-[#d9a74a]/20 transition hover:from-[#0d2d22] hover:to-[#1d4d3e]"
        >
          Go to cart & place order
        </Link>
      </div>
    </div>
  );
};

export default LatestCollection;
