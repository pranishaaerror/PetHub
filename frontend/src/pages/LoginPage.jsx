import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarHeart, Eye, EyeClosed, EyeOff, UsersRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Button } from "@headlessui/react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "../Firebase";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import {
  clearStoredAuth,
  establishUserSession,
  getAppHomePath,
  isAdminEmail,
  resolveRedirectPath,
} from "../utils/authSession";
import { useState } from "react";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const requestedRedirect = new URLSearchParams(location.search).get("redirect");
  const signupHref =
    !requestedRedirect ? "/signup" : `/signup?redirect=${encodeURIComponent(requestedRedirect)}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
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
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleGoogleLogin = async () => {
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
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <AuthSplitLayout
      sideLabel="PetHub"
    >

      <div className="rounded-[32px] bg-white/92 p-6 shadow-[0_24px_60px_rgba(45,45,45,0.08)] md:p-8">
       <Link to="/" className=" mb-4 border border-[#D3D3D3] hover:border-[#F5C062] hover:bg-[#F8F1E6]  rounded-full flex gap-2 items-center py-2 px-4 w-fit">
        <ArrowLeft size={15} /> Back to Home
      </Link>
      <h1 className="text-[24px] font-semibold">Welcome Back 👋</h1>
      <p className="text-[#9a7355] text-[14px] mt-1">Sign in to your PetHub account</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#9a7355]">Email</span>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="h-[40px] w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] pethub-form-field"
            />
            {errors.email ? (
              <span className="mt-2 block text-sm text-[#C45F3E]">{errors.email.message}</span>
            ) : null}
          </label>

          <label className="block ">
            <span className="mb-2 block text-sm font-semibold text-[#9a7355]">Password</span>
            <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-[40px] w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] pethub-form-field"
            />
              <Button
              className="absolute right-[12px] top-1/2 -translate-y-1/2  cursor-pointer text-[#b8845a]"
                type="button"
                tabIndex={-1}
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ?
                <EyeOff/>
                :
                <Eye/>
                }
              </Button>
              </div>
            {errors.password ? (
              <span className="mt-2 block text-sm text-[#C45F3E]">{errors.password.message}</span>
            ) : null}
          </label>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-[#C77E1D]">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isSubmitting} className="pet-button-primary w-full text-white">
            {isSubmitting ? "Signing you in..." : "Log in to PetHub"}
          </Button>

          <div className="flex items-center gap-3 text-sm text-[#9A8464]">
            <span className="h-px flex-1 bg-[#E4D3BA]" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-[#E4D3BA]" />
          </div>

          <Button type="button" onClick={handleGoogleLogin} className="border border-[#D3D3D3] pet-button-secondary w-full cursor-pointer hover:border-[#F5C062] hover:bg-[#fdf6f0]">
             <GoogleIcon />
           <span className="ml-2">Continue with Google</span>
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6B6B6B]">
          Not a member yet?{" "}
          <Link to={signupHref} className="font-semibold text-[#C77E1D]">
            Create your account
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