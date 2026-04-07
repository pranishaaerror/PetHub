import { axiosInstance } from "../axios";

export const createRecord = (data) =>
  axiosInstance.request({
    url: "/records",
    method: "POST",
    data,
  });

export const getRecordsByPet = (petId) =>
  axiosInstance.request({
    url: `/records/${petId}`,
    method: "GET",
  });

export const updateRecord = ({ id, data }) =>
  axiosInstance.request({
    url: `/records/${id}`,
    method: "PATCH",
    data,
  });

export const deleteRecord = (id) =>
  axiosInstance.request({
    url: `/records/${id}`,
    method: "DELETE",
  });
