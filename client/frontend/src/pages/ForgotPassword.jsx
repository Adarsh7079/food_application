import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../store/features/auth/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { forgotPasswordStatus, error, message } = useSelector((state) => state.auth);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-14 max-w-md rounded-2xl border border-[#e8ddc8] bg-white p-6 shadow-lg">
      <h1 className="prata-regular mb-2 text-2xl text-[#173b30]">Forgot password</h1>
      <p className="mb-5 text-sm leading-6 text-[#798078]">Enter your account email and we’ll send you a secure password reset link.</p>
      {message && forgotPasswordStatus === "succeeded" && <p role="status" className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>}
      {error && forgotPasswordStatus === "failed" && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" autoComplete="email" className="mb-4 w-full rounded-lg border border-[#ddd6c8] px-4 py-3 text-sm outline-none focus:border-[#7fa58b]" />
      <button type="submit" disabled={forgotPasswordStatus === "loading"} className="w-full rounded-full bg-[#123d30] py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{forgotPasswordStatus === "loading" ? "Sending…" : "Send reset link"}</button>
    </form>
  );
};

export default ForgotPassword;
