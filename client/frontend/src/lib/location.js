export async function getCurrentLocation() {
  if (!window.isSecureContext) {
    throw new Error("Current location requires HTTPS or localhost. Choose an address instead.");
  }

  if (!navigator.geolocation) {
    throw new Error("This browser does not support location access. Choose an address instead.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
      (error) => {
        const messageByCode = {
          1: "Location permission is blocked. Allow location access for this site in your browser settings, then try again.",
          2: "Your device could not determine your location. Turn on device location services or choose an address.",
          3: "Location lookup timed out. Try again or choose an address.",
        };
        reject(new Error(
          messageByCode[error.code] || "Could not determine your location. Choose an address instead."
        ));
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000,
      },
    );
  });
}

export async function getReadableAddress({ latitude, longitude }) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
  });
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    { headers: { "Accept-Language": "en" } },
  );
  if (!response.ok) {
    throw new Error("The address lookup service could not be reached.");
  }

  const result = await response.json();
  const details = result.address || {};
  const addressParts = [
    [details.house_number, details.road].filter(Boolean).join(" "),
    details.neighbourhood || details.suburb || details.residential,
    details.city_district,
    details.city || details.town || details.village || details.city_district,
    details.state,
    details.postcode,
    details.country,
  ].filter(Boolean);
  const formattedAddress = [...new Set(addressParts)].join(", ");

  return formattedAddress || result.display_name || null;
}
