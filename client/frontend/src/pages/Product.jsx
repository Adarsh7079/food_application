import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContextContext";
import RelatedProducts from "../components/RelatedProducts";
import ProductDetailsModal from "../components/ProductDetailsModal";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [size, setSize] = useState("");

  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    const selectedProduct = products.find((item) => item._id === productId);
    setProductData(selectedProduct || false);
    setImage(
      Array.isArray(selectedProduct?.image)
        ? selectedProduct.image[0] || ""
        : selectedProduct?.image || ""
    );
    setSize("");
  }, [productId, products]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* product data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>

        {/* product info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="mt-2 flex items-center gap-1 text-green-600">
            {productData.ratingCount > 0 ? (
              <>
                <span aria-hidden="true">★★★★★</span>
                <p className="pl-2 text-sm text-gray-600">
                  {productData.rating} ({productData.ratingCount} ratings)
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">No ratings yet</p>
            )}
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          {productData.sizes?.length > 0 && (
            <div className="my-8 flex flex-col gap-4">
              <p>Select Portion</p>
              <div className="flex gap-2">
                {productData.sizes.map((item) => (
                  <button
                    type="button"
                    onClick={() => setSize(item)}
                    className={`border border-gray-300 bg-gray-100 px-4 py-2 ${
                      item === size ? "bg-orange-500" : ""
                    }`}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700 "
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5 border-gray-300" />
          <div className="text-sm text-gray-500 mt-5 flex-col gap-1">
            <p>Freshly prepared and served hot.</p>
            <p>Cash on delivery is available for your order.</p>
            <p>Easy replacement for damaged items within 24 hours.</p>
          </div>
        </div>
      </div>
      {/* Description and Reviews */}
      <div className="mt-10">
        <button
          type="button"
          onClick={() => setShowReviews(true)}
          className="rounded-xl border border-[#d9c9ab] px-5 py-3 text-sm font-semibold text-[#123d30]"
        >
          Read reviews and rate this dish ({productData.ratingCount || 0})
        </button>
      </div>

      {/* Display related products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
      <ProductDetailsModal
        product={showReviews ? productData : null}
        currency={currency}
        onClose={() => setShowReviews(false)}
        onAdd={() => addToCart(productData._id, size)}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
