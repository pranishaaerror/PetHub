import { useMutation } from "@tanstack/react-query";
import { createEngagementRequest } from "./apis";

export const useCreateEngagementRequest = () =>
  useMutation({
    mutationFn: createEngagementRequest,
    mutationKey: ["create-engagement-request"],
  });
