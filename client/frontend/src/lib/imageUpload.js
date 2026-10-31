import { apiClient } from "./apiClient";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("Could not read the selected image."));
  reader.onload = () => {
    if (typeof reader.result !== "string") {
      reject(new Error("Could not read the selected image."));
      return;
    }
    resolve(reader.result);
  };
  reader.readAsDataURL(file);
});

export async function uploadImage(file, { scope, restaurantId, token }) {
  if (!file || !ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 5 MB or smaller.");
  }
  const url = scope === "profile"
    ? "/api/v1/uploads/profile"
    : scope === "product" && restaurantId
      ? `/api/v1/uploads/products/${encodeURIComponent(restaurantId)}`
      : null;
  if (!url) throw new Error("Choose a valid image upload location.");

  const response = await apiClient.post(
    url,
    { image: await readAsDataUrl(file) },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
}

export async function deleteUploadedImage({ publicId, scope, restaurantId, token }) {
  const response = await apiClient.delete("/api/v1/uploads", {
    data: { publicId, scope, ...(restaurantId ? { restaurantId } : {}) },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
