import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, getApiErrorMessage, setApiAccessToken } from "../../../lib/apiClient";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (details, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/v1/auth/register", details, { skipAuthRefresh: true });
      if (!response.data.success) return rejectWithValue(response.data.message || "Could not create your account.");
      return response.data.message || "Account created. Check your email to verify it.";
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Could not create your account."));
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/v1/auth/login", credentials, { skipAuthRefresh: true });
      const data = response.data.data;
      if (!response.data.success || !data?.accessToken) {
        return rejectWithValue(response.data.message || "Could not sign in.");
      }
      setApiAccessToken(data.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      return { token: data.accessToken, user: data.user };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Could not sign in."));
    }
  },
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const refreshResponse = await apiClient.post("/api/v1/auth/refresh", {}, { skipAuthRefresh: true });
      const token = refreshResponse.data?.data?.accessToken;
      if (!token) throw new Error("Session refresh did not return an access token.");
      setApiAccessToken(token);
      const profileResponse = await apiClient.get("/api/v1/user/me");
      const user = profileResponse.data?.data;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return { token, user };
    } catch (error) {
      setApiAccessToken("");
      localStorage.removeItem("currentUser");
      return rejectWithValue(getApiErrorMessage(error, "Could not restore your session."));
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (sessionToken) => {
    const token = sessionToken;
    setApiAccessToken("");
    localStorage.removeItem("currentUser");
    if (token) {
      try {
        await apiClient.post("/api/v1/auth/logout", {}, {
          headers: { Authorization: "Bearer " + token },
          timeout: 5000,
          skipAuthRefresh: true,
        });
      } catch {
        // Clear the local session even if the API is unavailable.
      }
    }
  },
);

export const verifyUserEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (verificationToken, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/v1/auth/verify-email", {
        params: { token: verificationToken },
        skipAuthRefresh: true,
      });
      if (!response.data.success) return rejectWithValue(response.data.message || "Email verification failed.");
      return response.data.message || "Email verified. You can now sign in.";
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Email verification failed."));
    }
  },
);

export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerificationEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/v1/auth/resend-verification", { email }, { skipAuthRefresh: true });
      if (!response.data.success) return rejectWithValue(response.data.message || "Could not send a verification email.");
      return response.data.message || "A new verification email has been sent.";
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Could not send a verification email."));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: "",
    sessionStatus: "idle",
    currentUser: readUser(),
    loginStatus: "idle",
    signupStatus: "idle",
    logoutStatus: "idle",
    verificationStatus: "idle",
    resendStatus: "idle",
    error: null,
    message: null,
  },
  reducers: {
    clearAuthFeedback(state) {
      state.error = null;
      state.message = null;
      state.loginStatus = "idle";
      state.signupStatus = "idle";
    },
    accessTokenRefreshed(state, action) {
      state.token = action.payload;
      if (!action.payload) state.currentUser = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(signupUser.pending, (state) => { state.signupStatus = "loading"; state.error = null; state.message = null; })
      .addCase(signupUser.fulfilled, (state, action) => { state.signupStatus = "succeeded"; state.message = action.payload; })
      .addCase(signupUser.rejected, (state, action) => { state.signupStatus = "failed"; state.error = action.payload; })
      .addCase(loginUser.pending, (state) => { state.loginStatus = "loading"; state.error = null; state.message = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loginStatus = "failed"; state.error = action.payload; })
      .addCase(restoreSession.pending, (state) => { state.sessionStatus = "loading"; })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.sessionStatus = "succeeded";
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.sessionStatus = "failed";
        state.token = "";
        state.currentUser = null;
      })
      .addCase(logoutUser.pending, (state) => {
        state.token = "";
        state.currentUser = null;
        state.logoutStatus = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = "";
        state.currentUser = null;
        state.logoutStatus = "succeeded";
        state.loginStatus = "idle";
      })
      .addCase(verifyUserEmail.pending, (state) => { state.verificationStatus = "loading"; state.error = null; state.message = null; })
      .addCase(verifyUserEmail.fulfilled, (state, action) => { state.verificationStatus = "succeeded"; state.message = action.payload; })
      .addCase(verifyUserEmail.rejected, (state, action) => { state.verificationStatus = "failed"; state.error = action.payload; })
      .addCase(resendVerificationEmail.pending, (state) => { state.resendStatus = "loading"; state.error = null; state.message = null; })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => { state.resendStatus = "succeeded"; state.message = action.payload; })
      .addCase(resendVerificationEmail.rejected, (state, action) => { state.resendStatus = "failed"; state.error = action.payload; })
      .addMatcher((action) => action.type === "restaurant/register/fulfilled", (state) => {
        const roles = state.currentUser?.roles || [];
        state.currentUser = { ...state.currentUser, roles: [...new Set([...roles, "RESTAURANT"])] };
      })
      .addMatcher((action) => action.type === "profile/fetchMyProfile/fulfilled" || action.type === "profile/saveMyProfile/fulfilled", (state, action) => {
        state.currentUser = { ...state.currentUser, ...action.payload };
      });
  },
});

export const { clearAuthFeedback, accessTokenRefreshed } = authSlice.actions;
export default authSlice.reducer;
