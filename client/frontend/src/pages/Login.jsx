import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContextContext";
import { getRole } from "../features/dashboard/routes/roles";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAuthFeedback,
  locationAnalyticsConsentUpdated,
  loginUser,
  signupUser,
} from "../store/features/auth/authSlice";
import { toast } from "react-toastify";
import { apiClient, getApiErrorMessage } from "../lib/apiClient";
import { getCurrentLocation } from "../lib/location";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { navigate } = useContext(ShopContext);
  const dispatch = useDispatch();
  const { token, currentUser, loginStatus, signupStatus, error, message } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentSaving, setConsentSaving] = useState(false);
  const [consentError, setConsentError] = useState("");
  const recordedLoginToken = useRef("");
  const isSignup = currentState === "Sign Up";
  const isLoading = isSignup ? signupStatus === "loading" : loginStatus === "loading";
  const needsLocationConsent = Boolean(
    token &&
    currentUser?.roles?.includes("CUSTOMER") &&
    currentUser.locationAnalyticsConsent !== true &&
    currentUser.locationAnalyticsConsent !== false,
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSignup) dispatch(signupUser({ name, email, password }));
    else dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (signupStatus === "succeeded") {
      setCurrentState("Login");
      toast.success(message || "Account created. Check your email to verify it.");
    } else if (signupStatus === "failed") {
      toast.error(error || "Could not create your account. Please try again.");
    }
  }, [signupStatus, message, error]);

  useEffect(() => {
    if (loginStatus === "succeeded") {
      toast.success("Signed in successfully.");
    } else if (loginStatus === "failed") {
      toast.error(error || "Sign in failed. Check your email and password and try again.");
    }
  }, [loginStatus, error]);

  useEffect(() => {
    if (
      loginStatus !== "succeeded" ||
      !token ||
      currentUser?.locationAnalyticsConsent !== true ||
      recordedLoginToken.current === token
    ) {
      return;
    }

    recordedLoginToken.current = token;
    getCurrentLocation()
      .then((coordinates) => apiClient.post("/api/v1/user/location-activity", coordinates))
      .catch((requestError) => {
        toast.info(getApiErrorMessage(requestError, "This login location was not recorded."));
      });
  }, [loginStatus, token, currentUser?.locationAnalyticsConsent]);

  useEffect(() => {
    if (token && !needsLocationConsent) {
      const role = getRole(currentUser);
      navigate(role === "superAdmin" ? "/dashboard/super-admin" : role === "restaurant" ? "/dashboard/restaurant" : role === "admin" ? "/dashboard/admin" : "/");
    }
  }, [token, currentUser, navigate, needsLocationConsent]);

  const chooseLocationConsent = async (consent) => {
    if (consentSaving) return;
    setConsentSaving(true);
    setConsentError("");
    let coordinates = null;

    if (consent) {
      try {
        coordinates = await getCurrentLocation();
      } catch (locationError) {
        toast.info(`${locationError.message} You can enable location access later from your profile.`);
      }
    }

    try {
      await apiClient.patch("/api/v1/user/me/location-consent", { consent });
      if (consent) recordedLoginToken.current = token;
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...currentUser, locationAnalyticsConsent: consent }),
      );
      dispatch(locationAnalyticsConsentUpdated(consent));
      if (coordinates) {
        try {
          await apiClient.post("/api/v1/user/location-activity", coordinates);
        } catch (requestError) {
          toast.error(getApiErrorMessage(requestError, "Could not record this login location."));
        }
      }
    } catch (requestError) {
      setConsentError(getApiErrorMessage(requestError, "Could not save your location preference."));
      setConsentSaving(false);
      return;
    }

    const role = getRole(currentUser);
    navigate(role === "superAdmin" ? "/dashboard/super-admin" : role === "restaurant" ? "/dashboard/restaurant" : role === "admin" ? "/dashboard/admin" : "/");
    setConsentSaving(false);
  };

  const switchState = (state) => {
    dispatch(clearAuthFeedback());
    setCurrentState(state);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="mx-auto mt-14 flex w-[90%] max-w-96 flex-col items-center gap-4 text-gray-800">
      <div className="mb-2 mt-10 inline-flex items-center gap-2">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="h-[1.5px] w-8 border-none bg-gray-800" />
      </div>
      {isSignup && <input onChange={(event) => setName(event.target.value)} value={name} type="text" className="w-full border border-gray-800 px-3 py-2" placeholder="Name" required minLength={2} maxLength={80} />}
      <input onChange={(event) => setEmail(event.target.value)} value={email} type="email" className="w-full border border-gray-800 px-3 py-2" placeholder="Email" required autoComplete="email" />
      <input onChange={(event) => setPassword(event.target.value)} value={password} type="password" className="w-full border border-gray-800 px-3 py-2" placeholder="Password" required autoComplete={isSignup ? "new-password" : "current-password"} minLength={isSignup ? 8 : 1} pattern={isSignup ? "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}" : undefined} title={isSignup ? "Use 8+ characters with a lowercase letter, uppercase letter, and number." : undefined} />

      <div className="mt-[-8px] flex w-full justify-between text-sm">
        <p className="text-gray-500">{isSignup ? "Use at least 8 characters." : ""}</p>
        {isSignup ? <button type="button" onClick={() => switchState("Login")} className="cursor-pointer">Login here</button> : <><button type="button" onClick={() => navigate("/forgot-password")} className="cursor-pointer text-[#31594b] hover:underline">Forgot password?</button><button type="button" onClick={() => switchState("Sign Up")} className="cursor-pointer">Create account</button></>}
      </div>
      {!isSignup && <button type="button" onClick={() => navigate("/resend-verification")} className="self-end text-sm text-blue-600 hover:underline">Resend verification email</button>}
      <button type="submit" disabled={isLoading} className="mt-4 bg-black px-8 py-2 font-light text-white disabled:cursor-wait disabled:opacity-60">{isLoading ? (isSignup ? "Creating account…" : "Signing in…") : (isSignup ? "Sign Up" : "Sign In")}</button>
    </form>
    {needsLocationConsent && (
      <div className="fixed inset-0 z-[3000] grid place-items-center bg-[#0d2d22]/70 p-4 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-labelledby="location-consent-title" className="w-full max-w-md rounded-3xl bg-[#fffaf2] p-6 shadow-2xl sm:p-8">
          <h2 id="location-consent-title" className="font-serif text-2xl font-bold text-[#123d30]">Share approximate location?</h2>
          <p className="mt-3 text-sm leading-6 text-[#52665d]">
            If you agree, your browser will share your location after sign-in. We round it to an area of roughly 1 km and store only daily login counts—not your name or exact GPS. Aggregate area counts are visible to restaurant partners and platform admins. You can turn this off in your profile; already aggregated counts remain.
          </p>
          {consentError && <p role="alert" className="mt-4 text-sm text-red-700">{consentError}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={consentSaving} onClick={() => chooseLocationConsent(false)} className="rounded-full border border-[#d9c9ab] px-5 py-3 text-sm font-semibold text-[#31594b] disabled:opacity-50">Not now</button>
            <button type="button" disabled={consentSaving} onClick={() => chooseLocationConsent(true)} className="rounded-full bg-[#123d30] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{consentSaving ? "Saving…" : "Allow approximate location"}</button>
          </div>
        </section>
      </div>
    )}
    </>
  );
};

export default Login;
