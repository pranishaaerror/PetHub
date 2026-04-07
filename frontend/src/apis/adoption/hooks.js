import { useQuery } from "@tanstack/react-query";
import { getAdoptionPetById, listAdoption } from "./apis";

export const useAdoption = () =>
  useQuery({
    queryFn: listAdoption,
    queryKey: ["get-adoption"],
  });

export const useAdoptionById = (id) =>
  useQuery({
    queryFn: () => getAdoptionPetById(id),
    queryKey: ["adoption-pet", id],
    enabled: Boolean(id),
  });
