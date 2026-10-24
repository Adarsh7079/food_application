import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContextContext";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { defaultIndianFoodItems } from "../data/defaultIndianFoodItems";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  // =====================================================
  // PREPARE CART DATA
  // =====================================================

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, products]);

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = (item) => {
    updateQuantity(
      item._id,
      item.size,
      item.quantity + 1
    );
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      updateQuantity(
        item._id,
        item.size,
        0
      );
      return;
    }

    updateQuantity(
      item._id,
      item.size,
      item.quantity - 1
    );
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartData.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-12">

        <div className="w-full max-w-2xl">

          <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/70 bg-gradient-to-br from-amber-50 via-orange-50 to-white shadow-xl">

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-300/20 rounded-full blur-3xl" />

            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl" />

            <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">

              {/* Food Icon */}
              <div className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-lg border border-amber-200 flex items-center justify-center">
                <span className="text-5xl sm:text-6xl">
                  🍛
                </span>
              </div>

              {/* Label */}
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-300/50 text-amber-800 text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em]">
                Your Cart is Waiting
              </span>

              {/* Heading */}
              <h1 className="mt-5 text-2xl sm:text-4xl font-black text-stone-900 font-serif leading-tight">
                Ohh... Aapne abhi tak
                <br />
                kuch order nahi kiya! 🥺
              </h1>

              {/* Quote */}
              <p className="mt-5 max-w-md mx-auto text-sm sm:text-base text-stone-600 leading-relaxed">
                <span className="font-semibold text-amber-700">
                  "Har khaali plate ek kahaani
                  ka intezaar karti hai..."
                </span>
                <br />
                Aapki next delicious kahaani
                bas ek click door hai. ❤️
              </p>

              {/* Browse */}
              <button
                onClick={() => navigate("/menu")}
                className="mt-8 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Browse Delicious Food
                <span className="text-lg">
                  →
                </span>
              </button>

              <p className="mt-4 text-[11px] text-stone-400">
                Freshly prepared • Full of flavour • Made with love
              </p>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // CART WITH ITEMS
  // =====================================================

  return (
    <div className="border-t pt-8 pb-20">

      {/* =================================================
          TOP HOME-STYLE FOOD QUOTE
      ================================================== */}

      <div className="relative overflow-hidden mb-10 rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50">

        {/* Decorative background */}
        <div className="absolute -right-10 -top-16 w-40 h-40 rounded-full bg-amber-300/20 blur-2xl" />

        <div className="absolute -left-10 -bottom-16 w-40 h-40 rounded-full bg-orange-300/20 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5 px-6 py-6 sm:px-10 sm:py-7">

          {/* Quote */}
          <div className="text-center sm:text-left">

            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-amber-700">
              Made with warmth & care
            </span>

            <h2 className="mt-2 text-xl sm:text-2xl font-black text-stone-900 font-serif">
              Ghar jaisa swaad,
              <br className="sm:hidden" />{" "}
              sehat ka khayal ❤️
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-stone-600">
              Har niwala pyaar se tayyar —
              <span className="font-semibold text-amber-700">
                {" "}just like home.
              </span>
            </p>

          </div>

          {/* Right Food Decoration */}
          <div className="flex items-center gap-2 sm:gap-3">

            <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm border border-amber-200 flex items-center justify-center text-xl sm:text-2xl">
              🥗
            </span>

            <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-md border border-amber-200 flex items-center justify-center text-2xl sm:text-3xl">
              🍛
            </span>

            <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm border border-amber-200 flex items-center justify-center text-xl sm:text-2xl">
              🌿
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          PAGE TITLE
      ================================================== */}

      <div className="mb-8">
        <Title
          text1={"YOUR"}
          text2={"ORDER"}
        />
      </div>

      {/* =================================================
          CART ITEMS
      ================================================== */}

      <div className="space-y-4">

        {cartData.map(
          (item, index) => {

            const productData =
              products.find(
                (product) =>
                  product._id === item._id
              ) ||
              defaultIndianFoodItems.find(
                (product) =>
                  product._id === item._id
              );

            const price =
              productData?.price ?? 0;

            const itemTotal =
              price * item.quantity;

            return (
              <div
                key={`${item._id}-${item.size}-${index}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-5 px-3 sm:px-4 border border-amber-100 rounded-2xl bg-gradient-to-r from-amber-50/50 to-white hover:border-amber-200 hover:shadow-sm transition-all"
              >

                {/* PRODUCT */}
                <div className="flex items-center gap-4 min-w-0">

                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-amber-50 shrink-0 border border-amber-100">

                    <img
                      className="w-full h-full object-cover"
                      src={
                        productData?.image?.[0] ||
                        assets.logo
                      }
                      alt={
                        productData?.name ||
                        "Cart item"
                      }
                    />

                  </div>

                  <div className="min-w-0">

                    <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate max-w-[220px] sm:max-w-[350px]">
                      {productData?.name ||
                        "Unknown item"}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-amber-700">
                      {currency}
                      {price}
                    </p>

                    <p className="text-xs text-stone-500 mt-1">
                      Portion: {item.size}
                    </p>

                    <p className="text-xs text-stone-500 mt-1">
                      Item Total:{" "}
                      <span className="font-semibold text-stone-700">
                        {currency}
                        {itemTotal}
                      </span>
                    </p>

                  </div>

                </div>

                {/* QUANTITY + DELETE */}
                <div className="flex items-center justify-between sm:justify-end gap-5">

                  {/* QUANTITY */}
                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        decreaseQuantity(item)
                      }
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-amber-600 text-lg font-semibold transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span className="min-w-[22px] text-center text-sm font-bold text-stone-900">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(item)
                      }
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-amber-600 text-lg font-semibold transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>

                  {/* DELETE */}
                  <button
                    onClick={() =>
                      updateQuantity(
                        item._id,
                        item.size,
                        0
                      )
                    }
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <img
                      className="w-4 sm:w-5 opacity-70 hover:opacity-100"
                      src={assets.bin_icon}
                      alt="Remove"
                    />
                  </button>

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* =================================================
          CART TOTAL
      ================================================== */}

      <div className="mt-12 flex justify-end">

        <div className="w-full sm:w-[450px]">

          <CartTotal />

          <button
            onClick={() =>
              navigate("/place-order")
            }
            className="w-full bg-black hover:bg-stone-800 text-white text-sm font-bold mt-6 px-8 py-3.5 rounded-xl active:scale-[0.98] transition-all shadow-md"
          >
            PROCEED TO CHECKOUT
          </button>

          <button
            onClick={() =>
              navigate("/menu")
            }
            className="w-full mt-3 text-sm font-semibold text-amber-700 hover:text-amber-800 py-2 transition-colors"
          >
            ← Continue Shopping
          </button>

        </div>

      </div>

    </div>
  );
};

export default Cart;