import { axiosInstance } from "../axios";

export const getInfo = ({token} = {}) => axiosInstance.request({
    url: "/users/me",
    method:"GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
})

export const updateUserProfile = ({ displayName, contactNumber, avatar, preferences }) =>
  axiosInstance.request({
    url: "/users/me",
    method: "PATCH",
    data: {
      fullName: displayName,
      phoneNumber: contactNumber,
      avatar,
      preferences,
    },
  });

export const requestPasswordResetOtp = ({ email }) =>
  axiosInstance.request({
    url: "/auth/forgot-password",
    method: "POST",
    data: {
      email,
    },
  });

export const resetPasswordWithOtp = ({ email, otp, newPassword }) =>
  axiosInstance.request({
    url: "/auth/reset-password",
    method: "POST",
    data: {
      email,
      otp,
      newPassword,
    },
  });
