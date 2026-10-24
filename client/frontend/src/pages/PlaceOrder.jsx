import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContextContext";
import { defaultIndianFoodItems } from "../data/defaultIndianFoodItems";

import { apiClient, getApiErrorMessage } from "../lib/apiClient";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProfile } from "../store/features/profile/profileSlice";
import { getCurrentLocation, getReadableAddress } from "../lib/location";

const PlaceOrder = () => {
  const [shareLocation, setShareLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    navigate,
    cartItems,
    setCartItems,
    getCartCount,
    getCartPricing,
    products,
    deliveryLocation,
  } = useContext(ShopContext);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const pricing = getCartPricing();
  const hasCartItems = getCartCount() > 0;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    if (deliveryLocation.coordinates) return;
    setFormData((current) => ({
      ...current,
      street: current.street || deliveryLocation.address || deliveryLocation.label,
    }));
  }, [deliveryLocation]);

  useEffect(() => {
    if (!token) return undefined;

    let isMounted = true;
    dispatch(fetchMyProfile())
      .unwrap()
      .then((profile) => {
        if (!isMounted) return;

        const [firstName = "", ...lastNameParts] = (profile.name || "")
          .trim()
          .split(/\s+/);
        setFormData((current) => ({
          ...current,
          firstName: firstName || current.firstName,
          lastName: lastNameParts.join(" ") || current.lastName,
          email: profile.email || current.email,
          street: profile.address || current.street,
          phone: profile.phoneNumber || current.phone,
        }));
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(
            typeof error === "string"
              ? error
              : "Could not load your saved profile details."
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, token]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const getLocationDetails = () =>
    new Promise((resolve) => {
      if (deliveryLocation.coordinates) {
        resolve(deliveryLocation.address || deliveryLocation.label);
        return;
      }

      if (!shareLocation) {
        resolve(deliveryLocation.label);
        return;
      }

      getCurrentLocation()
        .then(async (coordinates) => {
          try {
            resolve(
              await getReadableAddress(coordinates) ||
              `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
            );
          } catch (error) {
            console.error("Reverse geocoding failed during checkout:", error);
            resolve(deliveryLocation.label);
          }
        })
        .catch((error) => {
          toast.info(`${error.message} Using ${deliveryLocation.label} instead.`);
          resolve(deliveryLocation.label);
        });
    });

  const emailWhatsAppCheckout = async (orderItems, location) => {
    const address = [
      `${formData.firstName} ${formData.lastName}`.trim(),
      formData.street.trim(),
      formData.city.trim(),
      formData.state.trim(),
      formData.postalCode.trim(),
    ]
      .filter(Boolean)
      .join(", ");
    const emailLocation =
      location === "Location not shared" ? deliveryLocation.label : location;

    try {
      const response = await apiClient.post(
        "/api/v1/orders/whatsapp-notification",
        {
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerEmail: formData.email.trim(),
          phoneNumber: formData.phone.trim(),
          deliveryAddress: address,
          location: emailLocation,
          items: orderItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.price),
          })),
        },
      );
      return {
        sent: response.data?.data?.notificationEmailSent === true,
        message: response.data?.message,
      };
    } catch (error) {
      console.error("Could not send WhatsApp checkout notification:", error);
      return {
        sent: false,
        message: getApiErrorMessage(error, "Could not send the order email."),
      };
    }
  };

  const openOrderConfirmationInWhatsApp = (
    orderItems,
    pricing,
    location,
    confirmationNote = ""
  ) => {
    const itemLines = orderItems
      .map((item) => `• ${item.name} × ${item.quantity} — ₹${item.price * item.quantity}`)
      .join("\n");
    const message = [
      "*New ZaykaNest COD Order*",
      `Customer: ${formData.firstName} ${formData.lastName}`,
      `Phone: ${formData.phone}`,
      `Email: ${formData.email}`,
      `Address: ${formData.street}, ${formData.city}`,
      `Location: ${location === "Location not shared" ? "Not shared; use the delivery address above" : location}`,
      ...(confirmationNote ? [`Note: ${confirmationNote}`] : []),
      "",
      "*Items*",
      itemLines,
      "",
      `Subtotal: ₹${pricing.subtotal.toFixed(2)}`,
      ...(pricing.discount > 0
        ? [`Offer discount (${pricing.discountPercent}%): -₹${pricing.discount.toFixed(2)}`]
        : []),
      `Delivery: ${pricing.shippingFee === 0 ? "FREE" : `₹${pricing.shippingFee.toFixed(2)}`}`,
      `Payment: Cash on Delivery`,
      `Final amount: ₹${pricing.total.toFixed(2)}`,
    ].join("\n");
    const encodedMessage = encodeURIComponent(message);

    window.setTimeout(() => {
      window.location.assign(`https://wa.me/919709628329?text=${encodedMessage}`);
    }, 1500);
  };

  const redirectToWhatsAppCheckout = async (orderItems, pricing, location, note) => {
    const emailResult = await emailWhatsAppCheckout(orderItems, location);
    if (emailResult.sent) {
      toast.success("Order details emailed to the admin. Opening WhatsApp to confirm.");
    } else {
      toast.error(`${emailResult.message || "Order email failed."} Opening WhatsApp so you can still confirm.`);
    }
    setCartItems({});
    openOrderConfirmationInWhatsApp(orderItems, pricing, location, note);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    let orderItems = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          const itemInfo = structuredClone(
            products.find((product) => product._id === items) ||
              defaultIndianFoodItems.find((product) => product._id === items)
          );
          if (itemInfo) {
            itemInfo.size = item;
            itemInfo.quantity = cartItems[items][item];
            orderItems.push(itemInfo);
          }
        }
      }
    }

    if (orderItems.length === 0) {
      toast.error("Your cart is empty. Add items before placing an order.");
      return;
    }

    const cityValue = formData.city.trim().toLowerCase();
    if (
      !cityValue.includes("gurugram") &&
      !cityValue.includes("gurgaon") &&
      !cityValue.includes("gurugam")
    ) {
      toast.error(
        "We deliver only within Gurugram (Gurgaon). Please enter Gurugram as your city."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const location = await getLocationDetails();
      const pricing = getCartPricing();
      // Guest checkout remains available through the existing WhatsApp workflow.
      if (!token) {
        await redirectToWhatsAppCheckout(orderItems, pricing, location);
        return;
      }

      const byRestaurant = new Map();
      for (const item of orderItems) {
        if (!item.restaurantId || !/^[a-f0-9]{24}$/i.test(item._id)) {
          await redirectToWhatsAppCheckout(
            orderItems,
            pricing,
            location,
            "This menu item is not connected to online ordering."
          );
          return;
        }
        const restaurantItems = byRestaurant.get(item.restaurantId) || [];
        restaurantItems.push({ foodItemId: item._id, quantity: item.quantity });
        byRestaurant.set(item.restaurantId, restaurantItems);
      }
      if (byRestaurant.size !== 1) {
        await redirectToWhatsAppCheckout(
          orderItems,
          pricing,
          location,
          "The cart contains items from multiple restaurants."
        );
        return;
      }

      const deliveryAddress = {
        recipientName: `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.phone.trim(),
        line1: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: "IN",
      };
      const [[restaurantId, items]] = byRestaurant;
      const response = await apiClient.post(
        "/api/v1/orders",
        { restaurantId, items, deliveryAddress, paymentMethod: "COD" },
      );
      if (!response.data.success) throw new Error(response.data.message || "Failed to place COD order.");
      setCartItems({});
      if (response.data.data?.notificationEmailSent === false) {
        toast.warning("Order placed successfully, but the admin email could not be sent.");
      } else {
        toast.success("Order placed successfully.");
      }
      navigate("/orders");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Unable to complete the order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* left side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <p className="font-semibold">Delivery area notice</p>
          <p className="mt-1 text-xs leading-relaxed text-stone-700">
            We currently accept orders only from Gurugram (Gurgaon). Please keep the city as Gurugram so we can serve you quickly.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input required name="state" value={formData.state} onChange={onChangeHandler} className="w-full rounded border border-gray-300 px-3.5 py-1.5" placeholder="State" />
          <input required name="postalCode" value={formData.postalCode} onChange={onChangeHandler} className="w-full rounded border border-gray-300 px-3.5 py-1.5" placeholder="PIN code" minLength={3} maxLength={12} />
        </div>
        <div className="flex gap-3">
          <select
            required
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full bg-white text-stone-900"
          >
            <option value="Gurugram">Gurugram</option>
          </select>
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="tel"
          placeholder="Phone"
          pattern="\+?[1-9]\d{7,14}"
          title="Enter a valid phone number"
        />
        <label className="mt-2 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={shareLocation}
            onChange={(event) => setShareLocation(event.target.checked)}
            className="mt-1 h-4 w-4 accent-orange-600"
          />
          <span>
            Use my current browser location for delivery. If unavailable, we will use the selected navbar location and address.
          </span>
        </label>
      </div>
      {/* Righr Side  */}

      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="mt-4">
            <div className="rounded-xl border border-green-500 bg-green-50 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Cash on Delivery
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Pay in cash when your order is delivered.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[#2d6756]">
                    {pricing.discount > 0
                      ? `You save ₹${pricing.discount.toFixed(2)} with the ${pricing.discountPercent}% offer.`
                      : "Get 25% off when your items total ₹499 or more."}
                  </p>
                </div>
                <div className="h-5 w-5 rounded-full border border-green-500 bg-green-500"></div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-green-200 pt-3">
                <span className="text-sm font-semibold text-gray-700">Final amount to pay</span>
                <span className="text-xl font-black text-[#123d30]">₹{pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            {hasCartItems ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#123d30] px-10 py-3 text-sm font-bold text-white transition hover:bg-[#2d6756] disabled:cursor-wait disabled:opacity-60 sm:px-16"
              >
                {isSubmitting ? "PLACING ORDER..." : "PLACE COD ORDER"}
              </button>
            ) : (
              <div className="flex flex-col items-end gap-3">
                <p className="text-sm font-medium text-[#52665d]">
                  Your cart is empty. Add food before placing your order.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/menu")}
                  className="rounded-full bg-[#123d30] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#2d6756]"
                >
                  Browse menu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
