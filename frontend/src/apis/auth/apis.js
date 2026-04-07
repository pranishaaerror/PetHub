import { axiosInstance } from "../axios";

export const getInfo = () =>
  axiosInstance.request({
    url: "/auth/me",
    method: "GET",
  });

export const updateUserProfile = ({ displayName, contactNumber }) =>
  axiosInstance.request({
    url: "/auth/profile",
    method: "PATCH",
    data: {
      displayName,
      contactNumber,
    },
  });

export const setAccountType = ({ role }) =>
  axiosInstance.request({
    url: "/auth/account-type",
    method: "PATCH",
    data: { role },
  });

export const requestPasswordResetOtp = ({ email }) =>
  axiosInstance.request({
    url: "/auth/forgot-password",
    method: "POST",
    data: { email },
  });

export const resetPasswordWithOtp = ({ email, otp, newPassword }) =>
  axiosInstance.request({
    url: "/auth/reset-password",
    method: "POST",
    data: { email, otp, newPassword },
  });

export const initiateEmailSignup = ({ email, password, fullName, contactNumber, role }) =>
  axiosInstance.request({
    url: "/auth/signup/initiate",
    method: "POST",
    data: { email, password, fullName, contactNumber, role },
  });

export const resendSignupOtp = ({ email }) =>
  axiosInstance.request({
    url: "/auth/signup/resend-otp",
    method: "POST",
    data: { email },
  });

export const verifySignupOtp = ({ email, otp }) =>
  axiosInstance.request({
    url: "/auth/signup/verify-otp",
    method: "POST",
    data: { email, otp },
  });
