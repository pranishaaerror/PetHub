import { axiosInstance } from "../axios";

export const getCurrentUser = () =>
  axiosInstance.request({
    url: "/users/me",
    method: "GET",
  });

export const updateCurrentUser = ({ fullName, phoneNumber, avatar, preferences }) =>
  axiosInstance.request({
    url: "/users/me",
    method: "PATCH",
    data: {
      fullName,
      phoneNumber,
      avatar,
      preferences,
    },
  });

export const getAllUsers = () =>
  axiosInstance.request({
    url: "/users",
    method: "GET",
  });
