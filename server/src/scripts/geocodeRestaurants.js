const mongoose = require("mongoose");
const connectDB = require("../db");
const Restaurant = require("../models/restaurant.model");
const { geocodeRestaurantAddress } = require("../services/geocoding.service");

const geocodeRestaurants = async () => {
  await connectDB();
  const restaurants = await Restaurant.find({
    isDeleted: { $ne: true },
    $or: [
      { "location.latitude": null },
      { "location.longitude": null },
    ],
  }).sort({ createdAt: 1 });

  let failed = 0;
  for (const restaurant of restaurants) {
    try {
      restaurant.location = await geocodeRestaurantAddress(restaurant.address);
      await restaurant.save();
      console.log(`Geocoded restaurant ${restaurant._id}`);
    } catch (error) {
      failed += 1;
      console.error(`Could not geocode restaurant ${restaurant._id}: ${error.message}`);
    }
  }

  console.log(`Geocoded ${restaurants.length - failed} of ${restaurants.length} restaurants.`);
  await mongoose.disconnect();
  if (failed) process.exitCode = 1;
};

geocodeRestaurants().catch(async (error) => {
  console.error("Restaurant geocoding failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
