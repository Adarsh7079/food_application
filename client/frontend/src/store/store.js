import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import profileReducer from "./features/profile/profileSlice";
import restaurantReducer from "./features/restaurant/restaurantSlice";
import { accessTokenRefreshed } from "./features/auth/authSlice";
import { setAccessTokenListener } from "../lib/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    restaurant: restaurantReducer,
  },
});

setAccessTokenListener((token) => store.dispatch(accessTokenRefreshed(token)));
