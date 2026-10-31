const crypto = require("node:crypto");
const ApiError = require("../utils/ApiError");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_DATA_URI = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

const getConfig = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new ApiError(503, "Image uploads are not configured. Set the Cloudinary environment variables.");
  }
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  };
};

const signParams = (params, apiSecret) => {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(serialized + apiSecret).digest("hex");
};

const parseImageData = (dataUri) => {
  if (typeof dataUri !== "string") {
    throw new ApiError(400, "Choose an image to upload.");
  }
  const match = IMAGE_DATA_URI.exec(dataUri);
  if (!match) {
    throw new ApiError(400, "Use a JPEG, PNG, or WebP image.");
  }
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    throw new ApiError(413, "Images must be smaller than 5 MB.");
  }
  return { buffer, contentType: match[1] };
};

const cloudinaryRequest = async (endpoint, formData, apiSecret, signedParams) => {
  const { cloudName, apiKey } = getConfig();
  formData.append("api_key", apiKey);
  formData.append("signature", signParams(signedParams, apiSecret));
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/${endpoint}`,
    { method: "POST", body: formData, signal: AbortSignal.timeout(20000) },
  );
  const result = await response.json();
  if (!response.ok || result.error) {
    throw new ApiError(502, result.error?.message || "Cloudinary could not process the image.");
  }
  return result;
};

const uploadImage = async (dataUri, folder) => {
  const { buffer, contentType } = parseImageData(dataUri);
  const { apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: contentType }), "upload");
  formData.append("folder", folder);
  formData.append("timestamp", timestamp);
  const result = await cloudinaryRequest(
    "upload",
    formData,
    apiSecret,
    { folder, timestamp },
  );
  return { url: result.secure_url, publicId: result.public_id };
};

const deleteImage = async (publicId) => {
  const { apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp);
  const result = await cloudinaryRequest(
    "destroy",
    formData,
    apiSecret,
    { public_id: publicId, timestamp },
  );
  if (result.result !== "ok" && result.result !== "not found") {
    throw new ApiError(502, "Cloudinary did not confirm image deletion.");
  }
};

module.exports = { uploadImage, deleteImage, MAX_IMAGE_BYTES };
