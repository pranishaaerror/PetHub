import { axiosInstance } from "../axios";

export const listAdoption = () =>
  axiosInstance.request({ url: "/adoption", method: "GET" });

export const getAdoptionPetById = (id) =>
  axiosInstance.request({ url: `/adoption-pets/${id}`, method: "GET" });

export const adminCreateAdoptionPet = (data) =>
  axiosInstance.request({ url: "/adoption", method: "POST", data });

export const adminUpdateAdoptionPet = ({ petId, ...data }) =>
  axiosInstance.request({ url: `/adoption/${petId}`, method: "PUT", data });

export const adminDeleteAdoptionPet = ({ petId }) =>
  axiosInstance.request({ url: `/adoption/${petId}`, method: "DELETE" });

export const adminUploadAdoptionPetPhoto = ({ petId, file }) => {
  const formData = new FormData();
  formData.append("photo", file);
  return axiosInstance.request({
    url: `/adoption/${petId}/photo`,
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};
