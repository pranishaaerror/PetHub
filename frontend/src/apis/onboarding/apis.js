import { axiosInstance } from "../axios";

export const getOnboardingStatus = () =>
  axiosInstance.request({
    url: "/onboarding/status",
    method: "GET",
  });

export const saveOnboardingStep = ({ step, payload }) =>
  axiosInstance.request({
    url: "/onboarding/save-step",
    method: "POST",
    data: {
      step,
      payload,
    },
  });

export const completeOnboarding = (data) =>
  axiosInstance.request({
    url: "/onboarding/complete",
    method: "POST",
    data,
  });
