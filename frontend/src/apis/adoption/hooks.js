import { useMutation, useQuery } from "@tanstack/react-query";
import {
  adminCreateAdoptionPet, adminDeleteAdoptionPet,
  adminUpdateAdoptionPet, adminUploadAdoptionPetPhoto,
  getAdoptionPetById, listAdoption,
} from "./apis";

export const useAdoption = () =>
  useQuery({ queryFn: listAdoption, queryKey: ["get-adoption"] });

export const useAdoptionById = (id) =>
  useQuery({
    queryFn: () => getAdoptionPetById(id),
    queryKey: ["adoption-pet", id],
    enabled: Boolean(id),
  });

export const useAdminCreateAdoptionPet = () =>
  useMutation({ mutationFn: adminCreateAdoptionPet, mutationKey: ["admin-create-adoption-pet"] });

export const useAdminUpdateAdoptionPet = () =>
  useMutation({ mutationFn: adminUpdateAdoptionPet, mutationKey: ["admin-update-adoption-pet"] });

export const useAdminDeleteAdoptionPet = () =>
  useMutation({ mutationFn: adminDeleteAdoptionPet, mutationKey: ["admin-delete-adoption-pet"] });

export const useAdminUploadAdoptionPetPhoto = () =>
  useMutation({ mutationFn: adminUploadAdoptionPetPhoto, mutationKey: ["admin-upload-adoption-pet-photo"] });
