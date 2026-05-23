import { useMutation } from "@tanstack/react-query";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "./apis";

export const useInitiateKhaltiPayment = () =>
  useMutation({
    mutationFn: initiateKhaltiPayment,
    mutationKey: ["initiate-khalti-payment"],
  });

export const useVerifyKhaltiPayment = () =>
  useMutation({
    mutationFn: verifyKhaltiPayment,
    mutationKey: ["verify-khalti-payment"],
  });
