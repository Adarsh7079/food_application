const ApiError = require("../utils/ApiError");

let lastRequestAt = 0;
let requestQueue = Promise.resolve();

const geocodeRestaurantAddress = async (address) => {
  const query = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean).join(", ");
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({ q: query, format: "jsonv2", limit: "1" });

  const lookup = requestQueue.then(async () => {
    const waitMs = Math.max(0, 1000 - (Date.now() - lastRequestAt));
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastRequestAt = Date.now();
    return fetch(url, {
      headers: {
        "User-Agent": "ZaykaNest/1.0 (+https://zaykanest.in)",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(5000),
    });
  });
  requestQueue = lookup.then(() => undefined, () => undefined);

  let response;
  try {
    response = await lookup;
  } catch {
    throw new ApiError(503, "Restaurant address lookup is temporarily unavailable. Please try again.");
  }

  if (!response.ok) {
    throw new ApiError(503, "Restaurant address lookup is temporarily unavailable. Please try again.");
  }

  const results = await response.json();
  if (!results[0]) {
    throw new ApiError(422, "Could not find this restaurant address on the map. Check the address and try again.");
  }

  const location = {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
  };
  if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    throw new ApiError(503, "The address lookup returned invalid map coordinates. Please try again.");
  }
  return location;
};

module.exports = { geocodeRestaurantAddress };
