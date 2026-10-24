import { useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyUserEmail } from "../store/features/auth/authSlice";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const verificationToken = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const started = useRef(false);
  const { verificationStatus, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (verificationToken && !started.current) {
      started.current = true;
      dispatch(verifyUserEmail(verificationToken));
    }
  }, [dispatch, verificationToken]);

  useEffect(() => {
    if (verificationStatus !== "succeeded") return undefined;
    const timeout = window.setTimeout(() => navigate("/login"), 2500);
    return () => window.clearTimeout(timeout);
  }, [verificationStatus, navigate]);

  const missingToken = !verificationToken;
  const loading = verificationStatus === "loading" || (verificationStatus === "idle" && !missingToken);
  const failure = missingToken ? "Verification token missing." : error;

  return <main className="flex min-h-[60vh] items-center justify-center px-4 text-center">
    <section className="w-full max-w-md rounded-2xl border border-[#e8ddc8] bg-white p-8 shadow-lg">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#edf4ed] text-2xl text-[#34704d]">{loading ? "…" : failure ? "!" : "✓"}</div>
      <h1 className="prata-regular text-2xl text-[#173b30]">{loading ? "Verifying your email" : failure ? "Verification failed" : "Email verified"}</h1>
      <p role={failure ? "alert" : "status"} className={"mt-3 text-sm leading-6 " + (failure ? "text-[#a14a3d]" : "text-[#798078]")}>{loading ? "Please wait while we confirm your email address." : failure || message}</p>
      {!loading && <Link to="/login" className="mt-6 inline-flex rounded-full bg-[#123d30] px-5 py-3 text-xs font-semibold text-white">Continue to sign in</Link>}
    </section>
  </main>;
};

export default VerifyEmail;
