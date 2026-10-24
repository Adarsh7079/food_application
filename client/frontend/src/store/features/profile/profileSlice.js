import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, getApiErrorMessage } from "../../../lib/apiClient";

export const fetchMyProfile = createAsyncThunk(
  "profile/fetchMyProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/v1/user/me");
      const profile = response.data.data;
      localStorage.setItem("currentUser", JSON.stringify({ ...getState().auth.currentUser, ...profile }));
      return profile;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Could not load your profile."));
    }
  },
);

export const saveMyProfile = createAsyncThunk(
  "profile/saveMyProfile",
  async (profileUpdates, { getState, rejectWithValue }) => {
    try {
      const response = await apiClient.patch("/api/v1/user/me", profileUpdates);
      const profile = response.data.data;
      localStorage.setItem("currentUser", JSON.stringify({ ...getState().auth.currentUser, ...profile }));
      return profile;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Could not save your profile."));
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState: { data: null, loading: false, saving: false, error: null },
  reducers: { clearProfile: () => ({ data: null, loading: false, saving: false, error: null }) },
  extraReducers(builder) {
    builder
      .addCase(fetchMyProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(fetchMyProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(saveMyProfile.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(saveMyProfile.fulfilled, (state, action) => { state.saving = false; state.data = action.payload; })
      .addCase(saveMyProfile.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addMatcher((action) => action.type === "auth/logout/pending", () => ({ data: null, loading: false, saving: false, error: null }));
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
