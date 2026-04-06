import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  requestPasswordResetOtp,
  resendSignupOtp,
  resetPasswordWithOtp,
} from "../apis/auth/apis";
import Header from "./Header";
import Footer from "./Footer";
import { getAppHomePath, resolveRedirectPath } from "../utils/authSession";

const RESEND_INTERVAL_SECONDS = 60;

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtpAndLogin, refreshUserProfile } = useAuth();

  const initialEmail = location.state?.email || "";
  const initialContext = location.state?.from || "signup";

  const [email] = useState(initialEmail);
  const [context] = useState(initialContext);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_INTERVAL_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) return;
    setSecondsLeft(RESEND_INTERVAL_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [email]);

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      return setError("Please enter a valid 6-digit code.");
    }

    setLoading(true);
    try {
      if (context === "signup") {
        await verifyOtpAndLogin(email, otp);
        await refreshUserProfile(true);
        const fallback = getAppHomePath();
        navigate(resolveRedirectPath(location.state?.redirect, fallback), { replace: true });
      } else if (context === "forgotPassword" && location.state?.pendingNewPassword) {
        await resetPasswordWithOtp({
          email,
          otp,
          newPassword: location.state.pendingNewPassword,
        });
        setSuccess("Password reset successfully. You can now log in.");
        navigate("/login", { replace: true });
      } else {
        setError("Invalid verification context.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to verify code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resendLoading) return;
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      if (context === "signup") {
        await resendSignupOtp({ email });
      } else if (context === "forgotPassword") {
        await requestPasswordResetOtp({ email });
      }
      setSuccess("A new code has been sent to your email.");
      setSecondsLeft(RESEND_INTERVAL_SECONDS);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to resend code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const heading =
    context === "signup" ? "Verify your email" : "Verify OTP to reset password";

  const description =
    context === "signup"
      ? `We've sent a 6-digit verification code to ${email}.`
      : `We've sent a 6-digit reset code to ${email}.`;

  return (
    <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-16px)] max-w-[1500px] flex-col rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl">
        <Header />

        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="rounded-[32px] border border-[#E8E2D9] bg-white/92 p-8 shadow-[0_24px_60px_rgba(45,45,45,0.08)]">
              <h2 className="mb-1 text-2xl font-bold text-[#2D2D2D]">{heading}</h2>
              <p className="mb-6 text-sm leading-7 text-[#6B6B6B]">
                {description} The code expires in 5 minutes.
              </p>

              {error ? (
                <div className="mb-4 rounded-[18px] border border-[#F0C4B8] bg-[#FFF3F0] p-3 text-sm text-[#B54A32]">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="mb-4 rounded-[18px] border border-[#C8E6C9] bg-[#F1FAF1] p-3 text-sm text-[#2E6B2E]">
                  {success}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#8B7B66]">
                    Enter 6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pethub-form-field w-full rounded-[22px] bg-[#F8F1E6] px-4 py-3 text-center text-lg font-semibold tracking-[0.4em] text-[#2D2D2D] outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
                    placeholder="••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="pet-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying…" : "Verify code"}
                </button>
              </form>

              <div className="mt-5 text-center text-sm text-[#6B6B6B]">
                {secondsLeft > 0 ? (
                  <span>
                    You can resend a new code in <strong>{secondsLeft}s</strong>.
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="font-semibold text-[#C77E1D] underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? "Resending…" : "Resend code"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default OtpVerification;
