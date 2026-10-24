import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContextContext";
import { getRole } from "../features/dashboard/routes/roles";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthFeedback, loginUser, signupUser } from "../store/features/auth/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { navigate } = useContext(ShopContext);
  const dispatch = useDispatch();
  const { token, currentUser, loginStatus, signupStatus, error, message } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignup = currentState === "Sign Up";
  const isLoading = isSignup ? signupStatus === "loading" : loginStatus === "loading";

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
    if (token) {
      const role = getRole(currentUser);
      navigate(role === "superAdmin" ? "/dashboard/super-admin" : role === "restaurant" ? "/dashboard/restaurant" : role === "admin" ? "/dashboard/admin" : "/");
    }
  }, [token, currentUser, navigate]);

  const switchState = (state) => {
    dispatch(clearAuthFeedback());
    setCurrentState(state);
  };

  return (
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
        {isSignup ? <button type="button" onClick={() => switchState("Login")} className="cursor-pointer">Login here</button> : <button type="button" onClick={() => switchState("Sign Up")} className="cursor-pointer">Create account</button>}
      </div>
      {!isSignup && <button type="button" onClick={() => navigate("/resend-verification")} className="self-end text-sm text-blue-600 hover:underline">Resend verification email</button>}
      <button type="submit" disabled={isLoading} className="mt-4 bg-black px-8 py-2 font-light text-white disabled:cursor-wait disabled:opacity-60">{isLoading ? (isSignup ? "Creating account…" : "Signing in…") : (isSignup ? "Sign Up" : "Sign In")}</button>
    </form>
  );
};

export default Login;
