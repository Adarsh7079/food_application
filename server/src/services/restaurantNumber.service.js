const Counter = require("../models/counter.model");
const Restaurant = require("../models/restaurant.model");

const COUNTER_ID = "restaurantNumber";
const FIRST_RESTAURANT_NUMBER = 100001;

async function nextRestaurantNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: COUNTER_ID },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  return counter.sequence;
}

async function backfillRestaurantNumbers() {
  const highestRestaurant = await Restaurant.findOne({
    restaurantNumber: { $type: "number" },
  }).sort({ restaurantNumber: -1 }).select("restaurantNumber").lean();
  const highestNumber = Math.max(
    FIRST_RESTAURANT_NUMBER - 1,
    highestRestaurant?.restaurantNumber || 0,
  );

  await Counter.updateOne(
    { _id: COUNTER_ID },
    { $max: { sequence: highestNumber } },
    { upsert: true },
  );

  const restaurantsWithoutNumber = await Restaurant.find({
    $or: [
      { restaurantNumber: { $exists: false } },
      { restaurantNumber: null },
    ],
  }).sort({ createdAt: 1, _id: 1 }).select("_id").lean();

  for (const restaurant of restaurantsWithoutNumber) {
    const restaurantNumber = await nextRestaurantNumber();
    await Restaurant.updateOne(
      {
        _id: restaurant._id,
        $or: [
          { restaurantNumber: { $exists: false } },
          { restaurantNumber: null },
        ],
      },
      { $set: { restaurantNumber } },
    );
  }
}

module.exports = { nextRestaurantNumber, backfillRestaurantNumbers };
