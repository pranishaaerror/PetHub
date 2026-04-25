import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useState } from "react";
import { Button } from "../components/Button";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { app } from "../Firebase";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import Header from "./Header";
import Footer from "./Footer";
import { initiateEmailSignup } from "../apis/auth/apis";
import {
  clearStoredAuth,
  establishUserSession,
  getAppHomePath,
  isAdminEmail,
  resolveRedirectPath,
} from "../utils/authSession";
import { getAuthErrorMessage } from "../utils/authErrors";
import { getPasswordStrength } from "../utils/passwordStrength";

import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineInfoCircle } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { MdErrorOutline } from "react-icons/md";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const phonePattern = /^[+\d][\d\s-]{6,19}$/;

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name."),
    phoneNumber: z
      .string()
      .optional()
      .refine((v) => !v || phonePattern.test(v), "Please enter a valid phone number."),
    email: z.string().email("Please enter a valid email."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Add at least one uppercase letter.")
      .regex(/[a-z]/, "Add at least one lowercase letter.")
      .regex(/\d/, "Add at least one number.")
      .regex(/[^A-Za-z0-9]/, "Add at least one symbol."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const FieldError = ({ msg }) =>
  msg ? <p className="mt-2 text-sm font-medium text-[#C45F3E]">{msg}</p> : null;

export const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedRedirect = new URLSearchParams(location.search).get("redirect");
  const loginHref = !requestedRedirect
    ? "/login"
    : `/login?redirect=${encodeURIComponent(requestedRedirect)}`;

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", phoneNumber: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordStrength = getPasswordStrength(watch("password"));

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      const email = values.email.trim().toLowerCase();
      if (isAdminEmail(email))
        throw new Error("Admin accounts are invite-only. Please use the normal login page.");
      await initiateEmailSignup({
        email,
        password: values.password,
        fullName: values.fullName.trim(),
        contactNumber: values.phoneNumber?.trim() ?? "",
        role: "user",
      });
      toast.success("Check your email for a verification code.");
      navigate("/verify-signup", {
        replace: true,
        state: { email, from: "signup", redirect: requestedRedirect },
      });
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setSubmitError(message);
      toast.error(message);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitError("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const email = cred.user.email ?? "";
      if (isAdminEmail(email)) {
        await signOut(auth);
        clearStoredAuth();
        throw new Error("Admin accounts are login-only. Use the normal login page.");
      }
      await establishUserSession(auth, cred.user);
      toast.success("Welcome to PetHub. Continue with onboarding next.");
      navigate(resolveRedirectPath(requestedRedirect, getAppHomePath()));
    } catch (err) {
      clearStoredAuth();
      const message = getAuthErrorMessage(err);
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#F4EAD9] px-3 py-3 text-[#2D2D2D] sm:px-4 sm:py-4 md:px-5 md:py-5">
      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col overflow-hidden rounded-[28px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl sm:rounded-[36px]">
        <Header compact />

        <AuthSplitLayout sideLabel="PetHub" embedded fitViewport>
          <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white/95 p-5 shadow-[0_24px_60px_rgba(45,45,45,0.08)] sm:p-6">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
                Create your account
              </h1>
              <p className="text-sm leading-relaxed text-[#7A6A58]">
                Join PetHub to book care, track health records, and connect with your community.
              </p>
            </header>

            {submitError ? (
              <div
                className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-[#F0C4B8] bg-[#FFF3F0] px-4 py-3"
                role="alert"
              >
                <MdErrorOutline className="mt-0.5 shrink-0 text-[#C45F3E]" size={18} />
                <p className="text-sm font-medium text-[#9A3F2C]">{submitError}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-fullName" className="mb-1.5 block text-sm font-semibold text-[#5B544C]">
                    Full name
                  </label>
                  <input
                    id="signup-fullName"
                    {...register("fullName")}
                    placeholder="Your full name"
                    autoComplete="name"
                    aria-invalid={errors.fullName ? "true" : "false"}
                    className={`auth-input pethub-form-field ${errors.fullName ? "auth-input--error" : ""}`}
                  />
                  <FieldError msg={errors.fullName?.message} />
                </div>
                <div>
                  <label htmlFor="signup-phone" className="mb-1.5 block text-sm font-semibold text-[#5B544C]">
                    Phone <span className="font-normal text-[#9A8464]">(optional)</span>
                  </label>
                  <input
                    id="signup-phone"
                    {...register("phoneNumber")}
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    autoComplete="tel"
                    aria-invalid={errors.phoneNumber ? "true" : "false"}
                    className={`auth-input pethub-form-field ${errors.phoneNumber ? "auth-input--error" : ""}`}
                  />
                  <FieldError msg={errors.phoneNumber?.message} />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-sm font-semibold text-[#5B544C]">
                  Email
                </label>
                <input
                  id="signup-email"
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  className={`auth-input pethub-form-field ${errors.email ? "auth-input--error" : ""}`}
                />
                <FieldError msg={errors.email?.message} />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-password" className="mb-1.5 block text-sm font-semibold text-[#5B544C]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      {...register("password")}
                      type={showPwd ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      aria-invalid={errors.password ? "true" : "false"}
                      className={`auth-input pethub-form-field pr-12 ${errors.password ? "auth-input--error" : ""}`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showPwd ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#9A8464] transition hover:bg-[#F8F1E6]"
                      onClick={() => setShowPwd((p) => !p)}
                    >
                      {showPwd ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                    </button>
                  </div>
                  <FieldError msg={errors.password?.message} />
                  {watch("password") ? (
                    <div className="mt-1.5 flex gap-1" aria-hidden>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i < passwordStrength.score ? passwordStrength.tone : "bg-[#E8D9C4]"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-semibold text-[#5B544C]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-confirm"
                      {...register("confirmPassword")}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                      className={`auth-input pethub-form-field pr-12 ${errors.confirmPassword ? "auth-input--error" : ""}`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#9A8464] transition hover:bg-[#F8F1E6]"
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                    </button>
                  </div>
                  <FieldError msg={errors.confirmPassword?.message} />
                </div>
              </div>

              <p className="flex items-start gap-2 text-xs text-[#7A6A58]">
                <AiOutlineInfoCircle className="mt-0.5 shrink-0 text-[#C77E1D]" size={14} />
                Use uppercase, lowercase, a number, and a symbol for a stronger password.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="pet-button-primary h-11 w-full border-0 text-[15px] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? "Creating your account…" : "Create account"}
              </Button>

              <div className="flex items-center gap-3 text-xs font-medium text-[#9A8464]">
                <span className="h-px flex-1 bg-[#E4D3BA]" />
                <span className="shrink-0">or continue with</span>
                <span className="h-px flex-1 bg-[#E4D3BA]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                className="pet-button-secondary flex h-11 w-full items-center justify-center gap-2 border border-[#E8D9C4] text-[15px] font-semibold hover:border-[#F5C062] hover:bg-[#FFFBF5]"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-[#6B6B6B]">
              Already have an account?{" "}
              <Link to={loginHref} className="font-semibold text-[#C77E1D] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </AuthSplitLayout>

        <Footer compact />
      </div>
    </div>
  );
};
