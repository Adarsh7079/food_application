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

  return (
    <main className="grid min-h-[70vh] place-items-center bg-gradient-to-b from-[#fbf8f1] to-white px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#e8ddc8] bg-white p-7 text-center shadow-[0_20px_60px_rgba(18,61,48,0.12)] sm:p-9">
        <div className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full text-3xl ${loading ? "animate-pulse bg-[#eef4ef] text-[#527064]" : failure ? "bg-red-50 text-red-700" : "bg-[#e8f4ec] text-[#34704d]"}`} aria-hidden="true">{loading ? "…" : failure ? "!" : "✓"}</div>
        <h1 className="prata-regular text-3xl text-[#173b30]">{loading ? "Verifying your email" : failure ? "Verification failed" : "Email verified"}</h1>
        <p role={failure ? "alert" : "status"} className={`mt-3 text-sm leading-6 ${failure ? "text-[#a14a3d]" : "text-[#798078]"}`}>
          {loading ? "Please wait while we confirm your email address." : failure || message}
        </p>
        {!loading && <Link to="/login" className="mt-6 inline-flex rounded-full bg-[#123d30] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4d3e]">Continue to sign in</Link>}
      </section>
    </main>
  );
};

export default VerifyEmail;
