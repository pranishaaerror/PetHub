import { axiosInstance } from "../axios";

export const createAdoptionRequest = (data) =>
  axiosInstance.request({
    url: "/adoption-requests",
    method: "POST",
    data,
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
    data: { status },
  });

export const deleteAdoptionRequest = (requestId) =>
  axiosInstance.request({
    url: `/adoption-requests/${requestId}`,
    method: "DELETE",
  });
