import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContextContext";
import ProductDetailsModal from "./ProductDetailsModal";

const ProductItem = ({ id, image, name, price, description, rating, ratingCount = 0 }) => {
  const { currency, addToCart } = useContext(ShopContext);
  const [imgError, setImgError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const mainSrc = Array.isArray(image) ? image[0] : image;
  const product = { _id: id, image, name, price, description, rating, ratingCount };

  const handleAddToCart = async () => {
    const added = await addToCart(id, "default");
    if (added) setShowDetails(false);
  };

  return (
    <div className="group h-full text-stone-700">
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#d9c4a2] bg-[#f2e7cf] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#fc8019]/40 hover:shadow-lg">
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="relative block w-full overflow-hidden rounded-t-[2rem] bg-[#f7f1e7] text-left"
          aria-label={`View details for ${name}`}
        >
          {mainSrc && !imgError ? (
            <img
              className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              src={mainSrc}
              alt={name || "Dish image"}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div
              role="img"
              aria-label={name || "No image available"}
              className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#f7f1e7] to-[#e8d7b5] text-stone-600"
            >
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-[#123d30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v6m0 8v6M4 12h16" />
                </svg>
                <span className="mt-3 block text-sm font-medium text-stone-700">{name || "No image"}</span>
              </div>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-[#f6eedb]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b84e00] shadow-sm">
            Popular
          </span>
        </button>
        <div className="flex flex-1 flex-col space-y-3 p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="block w-full text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 min-h-14 text-base font-bold text-stone-900">{name}</p>
              {ratingCount > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-green-200">
                  <span aria-hidden="true">★</span>
                  {rating} ({ratingCount})
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#52665d]">
              {description || "Freshly prepared with carefully selected ingredients."}
            </p>
          </button>
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <span className="home-primary-button rounded-full px-4 py-2 text-sm font-bold shadow-md shadow-orange-200">
              {currency}
              {price}
            </span>
            <button
              type="button"
              onClick={handleAddToCart}
              className="home-primary-button whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold shadow-md shadow-[#d9a74a]/20 transition"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <ProductDetailsModal
        product={showDetails ? product : null}
        currency={currency}
        onClose={() => setShowDetails(false)}
        onAdd={handleAddToCart}
      />
    </div>
  );
};

export default ProductItem;
