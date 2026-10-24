const configuredApiUrl = import.meta.env.VITE_BACKEND_URL || "https://api.zaykanest.in";

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");
// The backend exposes the public products route. Set this to false only for a
// deployment where the menu endpoint is intentionally unavailable.
export const PRODUCTS_API_ENABLED = import.meta.env.VITE_PRODUCTS_API_ENABLED !== "false";

export function apiUrl(path) {
  return API_BASE_URL + "/" + path.replace(/^\/+/, "");
}
