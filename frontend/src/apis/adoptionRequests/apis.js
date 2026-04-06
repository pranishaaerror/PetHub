import { axiosInstance } from "../axios";

export const createAdoptionRequest = ({
  petId,
  message,
  fullName,
  email,
  contactNumber,
  householdType,
  lifestyle,
}) =>
  axiosInstance.request({
    url: "/adoption-requests",
    method: "POST",
    data: {
      petId,
      message,
      fullName,
      email,
      contactNumber,
      householdType,
      lifestyle,
    },
  });

export const getMyAdoptionRequests = () =>
  axiosInstance.request({
    url: "/adoption-requests/me",
    method: "GET",
  });

export const updateAdoptionRequestStatus = ({ requestId, status }) =>
  axiosInstance.request({
    url: `/adoption-requests/${requestId}/status`,
    method: "PATCH",
    data: {
      status,
    },
  });
