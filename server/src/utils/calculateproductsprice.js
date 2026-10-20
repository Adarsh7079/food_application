const calculateProductPrice = (product, now = new Date()) => {
  const originalPrice = product.price;
  const discount = product.discount;

  let discountAmount = 0;

  if (discount && discount.isActive && discount.value > 0) {
    const startDate = discount.startDate ? new Date(discount.startDate) : null;

    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    const isWithinDiscountPeriod =
      (!startDate || now >= startDate) && (!endDate || now <= endDate);

    if (isWithinDiscountPeriod) {
      if (discount.type === "PERCENTAGE") {
        discountAmount = originalPrice * (discount.value / 100);
      } else if (discount.type === "FIXED") {
        discountAmount = discount.value;
      }
    }
  }

  // A discount cannot reduce the price below zero.
  discountAmount = Math.min(originalPrice, discountAmount);

  // Round monetary values to two decimal places.
  discountAmount = Math.round(discountAmount * 100) / 100;

  const finalPrice = Math.round((originalPrice - discountAmount) * 100) / 100;

  return {
    originalPrice,
    discountAmount,
    finalPrice,
  };
};

module.exports = calculateProductPrice;
