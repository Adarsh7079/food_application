import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

let onAccessTokenChanged = () => {};
let refreshRequest;
let accessToken = "";

export const setAccessTokenListener = (listener) => {
  onAccessTokenChanged = listener;
};

export const setApiAccessToken = (token) => {
  accessToken = token || "";
};

apiClient.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest || originalRequest.skipAuthRefresh || !accessToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      refreshRequest ||= apiClient.post("/api/v1/auth/refresh", {}, { skipAuthRefresh: true })
        .then((response) => response.data?.data?.accessToken)
        .finally(() => { refreshRequest = null; });
      const nextToken = await refreshRequest;
      if (!nextToken) throw new Error("No access token returned by refresh endpoint.");
      accessToken = nextToken;
      onAccessTokenChanged(nextToken);
      originalRequest.headers.Authorization = `Bearer ${nextToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      accessToken = "";
      localStorage.removeItem("currentUser");
      onAccessTokenChanged("");
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.message || error.response?.data?.error || error.message || fallback;
}
