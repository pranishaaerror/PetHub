import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAdoptionRequest,
  getMyAdoptionRequests,
  updateAdoptionRequestStatus,
} from "./apis";

export const useMyAdoptionRequests = () =>
  useQuery({
    queryFn: getMyAdoptionRequests,
    queryKey: ["my-adoption-requests"],
  });

export const useCreateAdoptionRequest = () =>
  useMutation({
    mutationFn: createAdoptionRequest,
    mutationKey: ["create-adoption-request"],
  });

export const useUpdateAdoptionRequestStatus = () =>
  useMutation({
    mutationFn: updateAdoptionRequestStatus,
    mutationKey: ["update-adoption-request-status"],
  });
