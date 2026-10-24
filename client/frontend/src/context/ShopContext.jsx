import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { defaultIndianFoodItems } from "../data/defaultIndianFoodItems";
import { ShopContext } from "./ShopContextContext";
import { PRODUCTS_API_ENABLED } from "../config/api";

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 40;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cartItems") || "{}"); }
    catch { return {}; }
  });

  const [products, setProducts] = useState(
    defaultIndianFoodItems
  );


  // =====================================================
  // CART POPUP ITEM
  // =====================================================
  const [cartPopupItem, setCartPopupItem] = useState(() => {
    try {
      const savedItem =
        localStorage.getItem("cartPopupItem");

      return savedItem
        ? JSON.parse(savedItem)
        : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  // =====================================================
  // ADD TO CART
  // =====================================================
  const addToCart = async (itemId, size) => {
    const product = products.find(
      (product) => product._id === itemId
    );

    if (!product) {
      toast.error("Product not found");
      return;
    }

    const normalizedSize =
      size ||
      (product?.sizes?.length ? "" : "default");

    if (
      product?.sizes?.length &&
      !normalizedSize
    ) {
      toast.error("Select a portion first");
      return;
    }

    const cartSize =
      normalizedSize || "default";

    // ===================================================
    // SAVE POPUP ITEM
    // ===================================================
    const popupItem = {
      id: product._id,
      name: product.name,
      image: Array.isArray(product.image)
        ? product.image[0]
        : product.image,
    };

    setCartPopupItem(popupItem);

    localStorage.setItem(
      "cartPopupItem",
      JSON.stringify(popupItem)
    );

    // ===================================================
    // UPDATE CART
    // ===================================================
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][cartSize]) {
        cartData[itemId][cartSize] += 1;
      } else {
        cartData[itemId][cartSize] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][cartSize] = 1;
    }

    setCartItems(cartData);

  };

  // =====================================================
  // GET CART COUNT
  // =====================================================
  const getCartCount = useCallback(() => {
    let totalCount = 0;

    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        try {
          const quantity =
            cartItems[productId][size];

          if (quantity > 0) {
            totalCount += quantity;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    return totalCount;
  }, [cartItems]);

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================
  const updateQuantity = async (
    itemId,
    size,
    quantity
  ) => {
    let cartData = structuredClone(cartItems);

    // Remove item if quantity reaches zero
    if (quantity <= 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][size];

        if (
          Object.keys(cartData[itemId])
            .length === 0
        ) {
          delete cartData[itemId];
        }
      }
    } else {
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }

      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);

  };

  // =====================================================
  // CLEAR CART
  // =====================================================
  const clearCart = async () => {
    setCartItems({});

    setCartPopupItem(null);

    localStorage.removeItem(
      "cartPopupItem"
    );

  };

  // =====================================================
  // GET CART AMOUNT
  // =====================================================
  const getCartAmount = () => {
    let totalAmount = 0;

    for (const productId in cartItems) {
      const itemInfo = products.find(
        (product) =>
          product._id === productId
      );

      if (!itemInfo) continue;

      for (const variant in cartItems[productId]) {
        const quantity =
          cartItems[productId][variant];

        if (quantity > 0) {
          totalAmount +=
            itemInfo.price * quantity;
        }
      }
    }

    return totalAmount;
  };

  const getCartPricing = () => {
    const subtotal = getCartAmount();
    const qualifiesForOffer = subtotal >= 499;
    const discount = qualifiesForOffer
      ? Math.round(subtotal * 0.25)
      : 0;
    const shippingFee = subtotal === 0
      ? 0
      : qualifiesForOffer
        ? 0
        : delivery_fee;

    return {
      subtotal,
      discount,
      discountPercent: qualifiesForOffer ? 25 : 0,
      shippingFee,
      total: subtotal - discount + shippingFee,
    };
  };

  // =====================================================
  // GET PRODUCTS
  // =====================================================
  const getProductData =
    useCallback(async () => {
      if (!PRODUCTS_API_ENABLED) return;
      try {
        const response = await apiClient.get("/api/v1/products");

        if (response.data.success) {
          const apiProducts =
            response.data.data?.products ||
            response.data.data ||
            response.data.products ||
            [];

          const normalizedProducts = apiProducts.map((product) => ({
            ...product,
            image: Array.isArray(product.image) ? product.image : product.image ? [product.image] : [],
            sizes: [],
            category: typeof product.category === "object" ? product.category?.name || "Meals" : product.category,
            subCategory: product.foodType === "VEG" ? "Veg" : product.foodType === "NON_VEG" ? "Non-Veg" : "Egg",
            restaurantId: product.restaurant?._id || product.restaurant,
            restaurantName: product.restaurant?.name || "",
          }));
          setProducts(normalizedProducts);
        } else {
          toast.error(
            response.data.message
          );
        }
      } catch (error) {
        console.log(error);
        setProducts([]);
        toast.error(error.message);
      }
    }, []);

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================
  useEffect(() => {
    getProductData();
  }, [getProductData]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // =====================================================
  // REMOVE POPUP WHEN CART BECOMES EMPTY
  // =====================================================
  useEffect(() => {
    const count = getCartCount();

    if (count === 0) {
      setCartPopupItem(null);

      localStorage.removeItem(
        "cartPopupItem"
      );
    }
  }, [cartItems, getCartCount]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================
  const value = {
    products,

    currency,

    delivery_fee,

    search,
    setSearch,

    showSearch,
    setShowSearch,

    cartItems,
    setCartItems,

    addToCart,

    updateQuantity,

    clearCart,

    getCartCount,

    getCartAmount,

    getCartPricing,

    navigate,

    // Popup
    cartPopupItem,
    setCartPopupItem,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
