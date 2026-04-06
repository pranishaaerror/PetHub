import { useMutation } from "@tanstack/react-query";
import { initiateEsewaPayment } from "./apis";

export const useInitiateEsewaPayment = () =>
  useMutation({
    mutationFn: initiateEsewaPayment,
    mutationKey: ["initiate-esewa-payment"],
  });
