import { axiosInstance } from "../axios";

export const createPet = (data) =>
  axiosInstance.request({
    url: "/pets",
    method: "POST",
    data,
  });

export const getMyPets = () =>
  axiosInstance.request({
    url: "/pets/me",
    method: "GET",
  });

export const getPetById = (id) =>
  axiosInstance.request({
    url: `/pets/${id}`,
    method: "GET",
  });

export const updatePet = ({ id, data }) =>
  axiosInstance.request({
    url: `/pets/${id}`,
    method: "PATCH",
    data,
  });

export const uploadPetPhoto = ({ id, file }) => {
  const formData = new FormData();
  formData.append("photo", file);

  return axiosInstance.request({
    url: `/pets/${id}/photo`,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
