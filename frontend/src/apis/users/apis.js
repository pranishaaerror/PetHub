import { axiosInstance } from "../axios";

export const getCurrentUser = () =>
  axiosInstance.request({
    url: "/users/me",
    method: "GET",
  });

export const updateCurrentUser = ({
  fullName,
  phoneNumber,
  avatar,
  preferences,
  communityInterest,
  vetProfile,
  groomerProfile,
}) =>
  axiosInstance.request({
    url: "/users/me",
    method: "PATCH",
    data: {
      fullName,
      phoneNumber,
      avatar,
      preferences,
      communityInterest,
      vetProfile,
      groomerProfile,
    },
  });

export const getAllUsers = () =>
  axiosInstance.request({
    url: "/users",
    method: "GET",
  });

export const adminUpdateUser = ({ userId, role, disabled }) =>
  axiosInstance.request({
    url: `/users/${userId}`,
    method: "PATCH",
    data: { role, disabled },
  });

export const adminDeleteUser = ({ userId }) =>
  axiosInstance.request({
    url: `/users/${userId}`,
    method: "DELETE",
  });
