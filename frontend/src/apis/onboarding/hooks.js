import { useMutation, useQuery } from "@tanstack/react-query";
import { completeOnboarding, getOnboardingStatus, saveOnboardingStep } from "./apis";

export const useOnboardingStatus = () =>
  useQuery({
    queryFn: getOnboardingStatus,
    queryKey: ["onboarding-status"],
  });

export const useSaveOnboardingStep = () =>
  useMutation({
    mutationFn: saveOnboardingStep,
    mutationKey: ["save-onboarding-step"],
  });

export const useCompleteOnboarding = () =>
  useMutation({
    mutationFn: completeOnboarding,
    mutationKey: ["complete-onboarding"],
  });
