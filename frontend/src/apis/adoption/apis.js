import { axiosInstance } from "../axios";

export const listAdoption = () =>
  axiosInstance.request({
    url: "/adoption",
    method: "GET",
  });

export const getAdoptionPetById = (id) =>
  axiosInstance.request({
    url: `/adoption-pets/${id}`,
    method: "GET",
  });
