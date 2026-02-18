import { axiosInstance } from "../axios";

// Create new pet for adoption
export const createAdoption = ({ petName, breed, age, gender, intakeDate, status }) => 
  axiosInstance.request({
    url: "/adoption",
    method: "POST",
    data: {
      petName,
      breed,
      age,
      gender,
      intakeDate,
      status
    }
  });

// Get all pets
export const listAdoption = () => 
  axiosInstance.request({
    url: "/adoption",
    method: "GET"
  });

// Get pet by ID
export const getAdoptionById = (id) => 
  axiosInstance.request({
    url: `/adoption/${id}`,
    method: "GET"
  });

// Update pet information
export const updateAdoption = (id, { petName, breed, age, gender, intakeDate, status }) => 
  axiosInstance.request({
    url: `/adoption/${id}`,
    method: "PUT",
    data: {
      petName,
      breed,
      age,
      gender,
      intakeDate,
      status
    }
  });

// Delete pet
export const deleteAdoption = (id) => 
  axiosInstance.request({
    url: `/adoption/${id}`,
    method: "DELETE"
  });

// Get pets by status
export const getAdoptionByStatus = (status) => 
  axiosInstance.request({
    url: `/adoption/status/${status}`,
    method: "GET"
  });