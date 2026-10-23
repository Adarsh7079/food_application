import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const ProductDetailsModal = ({ product, currency = "₹", onClose, onAdd }) => {
  useEffect(() => {
    if (!product) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  if (!product) return null;

  const image = Array.isArray(product.image)
    ? product.image[0]
    : product.image;

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] flex min-h-dvh items-center justify-center overflow-y-auto bg-[#0d2d22]/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        className="relative my-auto grid w-full max-w-3xl overflow-hidden rounded-3xl border border-[#d9c9ab] bg-[#fffaf2] shadow-2xl md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c9ab] bg-[#fffaf2] text-xl font-semibold text-[#123d30] transition hover:bg-[#f3d7a1]"
          aria-label="Close product details"
        >
          ×
        </button>

        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-64 w-full object-cover md:h-full md:min-h-[390px]"
          />
        ) : (
          <div className="flex min-h-64 items-center justify-center bg-[#f2e7cf] text-6xl" aria-hidden="true">
            🍲
          </div>
        )}

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2d6756]">
            {product.category && <span>{product.category}</span>}
            {product.subCategory && (
              <span className="rounded-full bg-[#e8f0e9] px-2.5 py-1 normal-case tracking-normal text-[#123d30]">
                {product.subCategory}
              </span>
            )}
          </div>
          <h2 id="product-details-title" className="mt-3 font-serif text-2xl font-bold text-[#123d30] sm:text-3xl">
            {product.name}
          </h2>
          {product.rating && (
            <p className="mt-3 text-sm font-semibold text-[#2d6756]">
              <span aria-hidden="true">★</span> {product.rating} / 5
            </p>
          )}
          <p className="mt-4 leading-relaxed text-[#52665d]">
            {product.description || "Freshly prepared with carefully selected ingredients and ZaykaNest spices."}
          </p>
          <p className="mt-5 text-2xl font-black text-[#123d30]">
            {currency}{product.price}
          </p>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="mt-6 rounded-xl bg-[#123d30] px-5 py-3 text-sm font-bold text-[#fffaf2] transition hover:bg-[#2d6756] active:scale-[0.98]"
          >
            Add to cart
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
};

export default ProductDetailsModal;