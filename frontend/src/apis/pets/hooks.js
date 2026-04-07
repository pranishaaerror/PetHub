import { useMutation, useQuery } from "@tanstack/react-query";
import { createPet, getMyPets, getPetById, updatePet, uploadPetPhoto } from "./apis";

export const useMyPets = () =>
  useQuery({
    queryFn: getMyPets,
    queryKey: ["my-pets"],
  });

export const usePetById = (id) =>
  useQuery({
    queryFn: () => getPetById(id),
    queryKey: ["pet", id],
    enabled: Boolean(id),
  });

export const useCreatePet = () =>
  useMutation({
    mutationFn: createPet,
    mutationKey: ["create-pet"],
  });

export const useUpdatePet = () =>
  useMutation({
    mutationFn: updatePet,
    mutationKey: ["update-pet"],
  });

export const useUploadPetPhoto = () =>
  useMutation({
    mutationFn: uploadPetPhoto,
    mutationKey: ["upload-pet-photo"],
  });
