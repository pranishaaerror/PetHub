import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarHeart, Info, UsersRound, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useState } from "react";
import { Button } from "../components/Button";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import signupdog from "../assets/dogsignup.jpg";
import { app } from "../Firebase";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { updateUserProfile } from "../apis/auth/apis";
import { useAuth } from "../context/AuthContext";
import {
  clearStoredAuth,
  establishUserSession,
  getAppHomePath,
  isAdminEmail,
  resolveRedirectPath,
} from "../utils/authSession";
import { getPasswordStrength } from "../utils/passwordStrength";

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
      .refine((value) => !value || phonePattern.test(value), "Please enter a valid phone number."),
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
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const highlights = [
  { title: "Service booking", caption: "Vet, grooming, vaccine, and dental planning", icon: CalendarHeart },
  { title: "Community warmth", caption: "Meetups and playdates built into the same flow", icon: UsersRound },
];

export const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserProfile } = useAuth();
  const requestedRedirect = new URLSearchParams(location.search).get("redirect");
  const loginHref =
    !requestedRedirect ? "/login" : `/login?redirect=${encodeURIComponent(requestedRedirect)}`;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordStrength = getPasswordStrength(watch("password"));

  const onSubmit = async (values) => {
    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      if (isAdminEmail(normalizedEmail)) {
        throw new Error("Admin accounts are invite-only. Please use the normal login page.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, values.password);
      await updateFirebaseProfile(userCredential.user, {
        displayName: values.fullName.trim(),
      });
      await establishUserSession(auth, userCredential.user, true);
      await updateUserProfile({
        displayName: values.fullName.trim(),
        contactNumber: values.phoneNumber?.trim() ?? ""
      });
      await refreshUserProfile(true);
      toast.success("Your PetHub account is ready.");
      navigate(resolveRedirectPath(requestedRedirect, getAppHomePath()));
    } catch (error) {
      clearStoredAuth();
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const signedInEmail = userCredential.user.email ?? "";

      if (isAdminEmail(signedInEmail)) {
        await signOut(auth);
        clearStoredAuth();
        throw new Error("Admin accounts are login-only. Use the normal login page.");
      }

      await establishUserSession(auth, userCredential.user);
      toast.success("Welcome to PetHub. Continue with onboarding next.");
      navigate(resolveRedirectPath(requestedRedirect, getAppHomePath()));
    } catch (error) {
      clearStoredAuth();
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Signup"
      title="Create a premium home base for your pet's care."
      subtitle="Sign up once and keep wellness notes, service bookings, adoption favorites, and community moments tucked into one gentle, modern experience."
      image={signupdog}
      imageAlt="PetHub signup illustration"
      highlights={highlights}
      quote="The signup feels warm and polished, and the dashboard makes the entire care journey feel beautifully organized."
    >
   
      <div className="rounded-[32px] bg-white/92 p-6 shadow-[0_24px_60px_rgba(45,45,45,0.08)] md:p-8">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Full name</span>
              <input
                {...register("fullName")}
                placeholder="Enter your full name"
                className="pethub-form-field h-[40px] w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
              />
              {errors.fullName ? (
                <span className="mt-2 block text-sm text-[#C45F3E]">{errors.fullName.message}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Phone number</span>
              <input
                {...register("phoneNumber")}
                placeholder="+977 98XXXXXXXX"
                className="pethub-form-field h-[40px] w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
              />
              {errors.phoneNumber ? (
                <span className="mt-2 block text-sm text-[#C45F3E]">{errors.phoneNumber.message}</span>
              ) : null}
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Email</span>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="pethub-form-field h-[40px] w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
            />
            {errors.email ? (
              <span className="mt-2 block text-sm text-[#C45F3E]">{errors.email.message}</span>
            ) : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2 mb-2">
            {/* Password field */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Password</span>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Choose a strong password"
                  className="pethub-form-field h-[40px] w-full rounded-[22px] bg-[#F8F1E6] px-4 pr-11 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
                {/* ✅ Plain <button> — no Button component, no bg */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8464] hover:text-[#C77E1D] transition cursor-pointer bg-transparent border-none p-0 outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? (
                <span className="mt-2 block text-sm text-[#C45F3E]">{errors.password.message}</span>
              ) : null}
            </label>

            {/* Confirm Password field */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Confirm password</span>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  className="pethub-form-field h-[40px] w-full rounded-[22px] bg-[#F8F1E6] px-4 pr-11 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
                {/* ✅ Plain <button> — no Button component, no bg */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8464] hover:text-[#C77E1D] transition cursor-pointer bg-transparent border-none p-0 outline-none"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <span className="mt-2 block text-sm text-[#C45F3E]">{errors.confirmPassword.message}</span>
              ) : null}
            </label>
          </div>

          <div className="text-[#9a7355]">
            <Info className="inline-block" size={14} />
            <span className="text-[13px] leading-7 ml-2">Use uppercase, lowercase, number, and symbol for a stronger password.</span>
          </div>

          <Button type="submit" disabled={isSubmitting} className="pet-button-primary w-full text-white">
            {isSubmitting ? "Creating your account..." : "Create account"}
          </Button>

          <div className="flex items-center gap-3 text-sm text-[#9A8464]">
            <span className="h-px flex-1 bg-[#E4D3BA]" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-[#E4D3BA]" />
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignup}
           className="border border-[#D3D3D3] bg-white w-full cursor-pointer hover:border-[#F5C062] hover:bg-[#fdf6f0]"
          >
            <GoogleIcon />
            <span className="ml-2 text-black">Continue with Google</span>
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6B6B6B]">
          Already have an account?{" "}
          <Link to={loginHref} className="font-semibold text-[#C77E1D]">
            Log in
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}