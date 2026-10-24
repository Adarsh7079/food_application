import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, getApiErrorMessage } from "../../../lib/apiClient";

export const submitRestaurantApplication = createAsyncThunk("restaurant/register", async (details, { getState, rejectWithValue }) => {
  try {
    const { currentUser } = getState().auth;
    const response = await apiClient.post("/api/v1/restaurants", details);
    const updatedUser = { ...currentUser, roles: [...new Set([...(currentUser?.roles || []), "RESTAURANT"])] };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    return response.data.data;
  } catch (error) { return rejectWithValue(getApiErrorMessage(error, "Could not submit your application.")); }
});

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: { submitting: false, error: null, application: null },
  reducers: { clearRestaurantFeedback(state) { state.error = null; state.application = null; } },
  extraReducers(builder) {
    builder.addCase(submitRestaurantApplication.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(submitRestaurantApplication.fulfilled, (state, action) => { state.submitting = false; state.application = action.payload; })
      .addCase(submitRestaurantApplication.rejected, (state, action) => { state.submitting = false; state.error = action.payload; })
      .addMatcher((action) => action.type === "auth/logout/pending", () => ({ submitting: false, error: null, application: null }));
  },
});
export const { clearRestaurantFeedback } = restaurantSlice.actions;
export default restaurantSlice.reducer;
