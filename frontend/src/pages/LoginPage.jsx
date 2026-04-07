import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "../Firebase";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { Button } from "../components/Button";
import Header from "./Header";
import Footer from "./Footer";
import {
  clearStoredAuth,
  establishUserSession,
  getAppHomePath,
  isAdminEmail,
  resolveRedirectPath,
} from "../utils/authSession";
import { getAuthErrorMessage } from "../utils/authErrors";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { IoArrowBack } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#C45F3E]">
      <span className="inline-block h-1 w-1 rounded-full bg-[#C45F3E]" />
      {msg}
    </p>
  ) : null;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const requestedRedirect = new URLSearchParams(location.search).get("redirect");
  const signupHref =
    !requestedRedirect ? "/signup" : `/signup?redirect=${encodeURIComponent(requestedRedirect)}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    const normalizedEmail = values.email.trim().toLowerCase();
    const isAdminAttempt = isAdminEmail(normalizedEmail);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, values.password);
      const { profile } = await establishUserSession(auth, userCredential.user, isAdminAttempt);

      if (isAdminAttempt && profile.role !== "admin") {
        await signOut(auth);
        clearStoredAuth();
        throw new Error("This account does not have admin access.");
      }

      toast.success(isAdminAttempt ? "Admin login successful" : "Welcome back to PetHub.");
      navigate(resolveRedirectPath(requestedRedirect, getAppHomePath(profile)));
    } catch (error) {
      clearStoredAuth();
      const message = getAuthErrorMessage(error);
      setSubmitError(message);
      toast.error(message);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitError("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const signedInEmail = userCredential.user.email ?? "";

      if (isAdminEmail(signedInEmail)) {
        await signOut(auth);
        clearStoredAuth();
        throw new Error("Admin accounts must use the admin email and password login.");
      }

      await establishUserSession(auth, userCredential.user);
      toast.success("Google login successful.");
      navigate(resolveRedirectPath(requestedRedirect, getAppHomePath()));
    } catch (error) {
      clearStoredAuth();
      const message = getAuthErrorMessage(error);
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#F4EAD9] px-3 py-3 text-[#2D2D2D] sm:px-4 sm:py-4 md:px-5 md:py-5">
      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col overflow-hidden rounded-[28px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl sm:rounded-[36px]">
        <Header compact />

        <AuthSplitLayout sideLabel="PetHub" embedded fitViewport>
          <div className="mx-auto w-full max-w-md">
            <Link
              to="/"
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#E8D9C4] bg-white/80 px-4 py-2 text-sm font-semibold text-[#6B5C4A] transition hover:border-[#F5C062] hover:bg-[#FFF8EE]"
            >
              <IoArrowBack size={14} />
              Back to home
            </Link>

            <header className="mb-7">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1C1917] sm:text-3xl">
                Welcome back 👋
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-[#7A6A58]">
                Sign in to continue managing appointments, records, and your pet profile.
              </p>
            </header>

            {submitError && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-[16px] border border-[#F0C4B8] bg-[#FFF3F0] px-4 py-3.5"
                role="alert"
              >
                <MdErrorOutline className="mt-0.5 shrink-0 text-[#C45F3E]" size={18} />
                <p className="text-sm font-medium text-[#9A3F2C]">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-semibold text-[#5B544C]"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={`auth-input pethub-form-field w-full ${errors.email ? "auth-input--error" : ""}`}
                />
                <FieldError msg={errors.email?.message} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-[#5B544C]"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#C77E1D] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    autoComplete="current-password"
                    aria-invalid={errors.password ? "true" : "false"}
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`auth-input pethub-form-field w-full pr-12 ${errors.password ? "auth-input--error" : ""}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#9A8464] transition hover:bg-[#F8F1E6] hover:text-[#C77E1D]"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                </div>
                <FieldError msg={errors.password?.message} />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="pet-button-primary h-12 w-full border-0 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? "Signing you in…" : "Log in"}
              </Button>

              <div className="flex items-center gap-3 text-xs font-medium text-[#9A8464]">
                <span className="h-px flex-1 bg-[#E4D3BA]" />
                <span className="shrink-0">or</span>
                <span className="h-px flex-1 bg-[#E4D3BA]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[#E8D9C4] bg-white text-sm font-semibold text-[#3C3C3C] shadow-[0_2px_8px_rgba(45,45,45,0.06)] transition hover:border-[#F5C062] hover:bg-[#FFFBF5] hover:shadow-[0_4px_14px_rgba(45,45,45,0.10)]"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#6B6B6B]">
              Not a member yet?{" "}
              <Link to={signupHref} className="font-bold text-[#C77E1D] hover:underline">
                Create your account
              </Link>
            </p>
          </div>
        </AuthSplitLayout>

        <Footer compact />
      </div>
    </div>
  );
};
