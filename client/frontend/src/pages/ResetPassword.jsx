import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../store/features/auth/authSlice";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const dispatch = useDispatch();
  const { resetPasswordStatus, error, message } = useSelector((state) => state.auth);

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidationError("");
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setValidationError("Password must be at least 8 characters and include a lowercase letter, uppercase letter, and number.");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    dispatch(resetPassword({ token, password }));
  };

  return (
    <main className="min-h-[70vh] px-4 py-12 sm:py-16">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-3xl border border-[#e8ddc8] bg-white p-6 shadow-[0_20px_60px_rgba(18,61,48,0.12)] sm:p-8">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#eef6f0] text-2xl text-[#123d30]" aria-hidden="true">🔒</div>
        <h1 className="prata-regular mb-2 text-center text-3xl text-[#173b30]">Reset password</h1>
        <p className="mb-5 text-center text-sm leading-6 text-[#798078]">Choose a strong new password for your account.</p>
      {!token && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">The reset link is missing its token. Request a new link.</p>}
      {message && resetPasswordStatus === "succeeded" && <p role="status" className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>}
      {(validationError || (error && resetPasswordStatus === "failed")) && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{validationError || error}</p>}
      <input required type="password" minLength={8} maxLength={72} title="Use 8+ characters with a lowercase letter, uppercase letter, and number." value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" autoComplete="new-password" className="mb-4 w-full rounded-lg border border-[#ddd6c8] px-4 py-3 text-sm outline-none focus:border-[#7fa58b]" />
      <input required type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="mb-4 w-full rounded-lg border border-[#ddd6c8] px-4 py-3 text-sm outline-none focus:border-[#7fa58b]" />
      <button disabled={!token || resetPasswordStatus === "loading"} type="submit" className="w-full rounded-full bg-[#123d30] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{resetPasswordStatus === "loading" ? "Resetting…" : "Reset password"}</button>
        {resetPasswordStatus === "succeeded" && <Link to="/login" className="mt-5 block rounded-full bg-[#eef6f0] px-4 py-3 text-center text-sm font-semibold text-[#31594b] hover:bg-[#e2eee6]">Return to login</Link>}
      </form>
    </main>
  );
};

export default ResetPassword;
