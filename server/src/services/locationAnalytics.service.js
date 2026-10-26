const LocationActivity = require("../models/locationActivity.model");
const Restaurant = require("../models/restaurant.model");
const ApiError = require("../utils/ApiError");

const MINIMUM_VISIBLE_LOGINS = 5;

const recordCustomerLogin = async ({ latitude, longitude }) => {
  const latitudeCell = Math.round(latitude * 100) / 100;
  const longitudeCell = Math.round(longitude * 100) / 100;
  const now = new Date();
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const filter = { day, latitudeCell, longitudeCell };
  try {
    await LocationActivity.findOneAndUpdate(
      filter,
      { $inc: { loginCount: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    await LocationActivity.updateOne(filter, { $inc: { loginCount: 1 } });
  }
};

const getLocationAnalytics = async ({ from, to, search = "" }) => {
  const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : new Date(Date.now() - 29 * 86400000);
  const toDate = to ? new Date(`${to}T23:59:59.999Z`) : new Date();
  if (fromDate > toDate) throw new ApiError(400, "The start date must be before the end date");
  if (toDate.getTime() - fromDate.getTime() > 366 * 86400000) {
    throw new ApiError(400, "Choose a date range of one year or less");
  }

  const [cells, dailyActivity, restaurants] = await Promise.all([
    LocationActivity.aggregate([
      { $match: { day: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: { latitude: "$latitudeCell", longitude: "$longitudeCell" },
          loginCount: { $sum: "$loginCount" },
        },
      },
      { $match: { loginCount: { $gte: MINIMUM_VISIBLE_LOGINS } } },
      { $sort: { loginCount: -1 } },
      { $limit: 2000 },
    ]),
    LocationActivity.aggregate([
      { $match: { day: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: "$day", loginCount: { $sum: "$loginCount" } } },
      { $match: { loginCount: { $gte: MINIMUM_VISIBLE_LOGINS } } },
      { $sort: { _id: 1 } },
      { $limit: 367 },
    ]),
    Restaurant.find({ isDeleted: { $ne: true } })
      .select("name address location")
      .sort({ name: 1 })
      .limit(2000)
      .lean(),
  ]);

  const normalizedSearch = search.trim().toLowerCase();
  const loginLocations = cells
    .map(({ _id, loginCount }) => ({
      latitude: _id.latitude,
      longitude: _id.longitude,
      loginCount,
    }))
    .filter((cell) =>
      !normalizedSearch ||
      `${cell.latitude.toFixed(2)}, ${cell.longitude.toFixed(2)}`
        .toLowerCase()
        .includes(normalizedSearch),
    );

  const restaurantLocations = restaurants
    .filter((restaurant) =>
      Number.isFinite(restaurant.location?.latitude) &&
      Number.isFinite(restaurant.location?.longitude) &&
      (!normalizedSearch ||
        `${restaurant.name} ${restaurant.address?.city || ""} ${restaurant.address?.state || ""}`
          .toLowerCase()
          .includes(normalizedSearch)),
    )
    .map((restaurant) => ({
      id: restaurant._id,
      name: restaurant.name,
      city: restaurant.address?.city || "",
      latitude: restaurant.location.latitude,
      longitude: restaurant.location.longitude,
    }));

  return {
    loginLocations,
    restaurantLocations,
    dailyActivity: dailyActivity.map(({ _id, loginCount }) => ({
      date: _id.toISOString().slice(0, 10),
      loginCount,
    })),
    privacyThreshold: MINIMUM_VISIBLE_LOGINS,
  };
};

module.exports = { recordCustomerLogin, getLocationAnalytics };
