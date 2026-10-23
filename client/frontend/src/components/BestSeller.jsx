import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContextContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import MultiCardCarousel from "./MultiCardCarousel";

const BestSeller = () => {
  // get all the products data
  const { products } = useContext(ShopContext);
  // get those data which bestSeller property is true
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  return (
    <div>
      <div className="my-14 rounded-[2rem] bg-gradient-to-br from-orange-50 to-amber-50 p-6 sm:p-8">
        <div className="text-center text-3xl py-2">
          <Title text1={"FEATURED"} text2={"FAVOURITES"} />
          <p className="mx-auto mt-3 w-3/4 text-xs sm:text-sm md:text-base text-gray-600">
            Handpicked dishes loved by our customers for their flavour and comfort.
          </p>
        </div>

        <div className="mt-6">
          <MultiCardCarousel items={bestSeller} interval={3500} />
        </div>
      </div>
    </div>
  );
};

export default BestSeller;
