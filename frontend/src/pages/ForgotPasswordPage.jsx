import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import dog from "../assets/dog.jpg";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { requestPasswordResetOtp, resetPasswordWithOtp } from "../apis/auth/apis";
import { Button } from "../components/Button";

const highlights = [
  { title: "OTP by email", caption: "A one-time code lands in your inbox", icon: Mail },
  { title: "Safe reset flow", caption: "Choose a new password after OTP verification", icon: ShieldCheck },
];
// const signupSchema = z
//   .object({
   
//     password: z
//       .string()
//       .min(8, "Password must be at least 8 characters.")
//       .regex(/[A-Z]/, "Add at least one uppercase letter.")
//       .regex(/[a-z]/, "Add at least one lowercase letter.")
//       .regex(/\d/, "Add at least one number.")
//       .regex(/[^A-Za-z0-9]/, "Add at least one symbol."),
//     confirmPassword: z.string().min(1, "Please confirm your password."),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     path: ["confirmPassword"],
//     message: "Passwords do not match.",
//   });

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await requestPasswordResetOtp({ email: normalizedEmail });
      setEmail(normalizedEmail);
      setOtpSent(true);
      toast.success(data?.message || "OTP sent to your email.");
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const { data } = await resetPasswordWithOtp({
        email,
        otp: otp.trim(),
        newPassword,
      });

      toast.success(data?.message || "Password reset successfully.");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Reset Password"
      title="Reset your PetHub password without leaving the warm flow."
      subtitle="Enter your email, receive a one-time password in your inbox, and set a fresh password right away."
      image={dog}
      imageAlt="PetHub reset password illustration"
      highlights={highlights}
      quote="The reset flow should feel quick, safe, and easy enough to finish in one calm minute."
      sideLabel="PetHub"
    >
      <div className="rounded-[32px] bg-white/92 p-6 shadow-[0_24px_60px_rgba(45,45,45,0.08)] md:p-8">
        <div className="rounded-[24px] bg-[#FFF8EE] p-4 text-sm leading-7 text-[#6B6B6B]">
          We&apos;ll send a six-digit OTP to your email. Use it within 10 minutes to choose a new password.
        </div>

        <form onSubmit={otpSent ? handleResetPassword : handleRequestOtp} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
              required
            />
          </label>

          {otpSent ? (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">OTP code</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm tracking-[0.25em] text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Confirm password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                    required
                  />
                </label>
              </div>
            </>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="pet-button-primary w-full gap-2">
            <KeyRound className="h-4 w-4" />
            {isSubmitting
              ? otpSent
                ? "Resetting password..."
                : "Sending OTP..."
              : otpSent
                ? "Reset password"
                : "Send OTP to email"}
          </Button>

          {otpSent ? (
            <Button
              type="button"
              onClick={(event) => handleRequestOtp(event)}
              disabled={isSubmitting}
              className="pet-button-secondary w-full"
            >
              Resend OTP
            </Button>
          ) : null}
        </form>

        <div className="mt-6 text-center text-sm text-[#6B6B6B]">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-[#C77E1D]">
            Back to login
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
};
