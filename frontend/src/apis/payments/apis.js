import { axiosInstance } from "../axios";

export const initiateKhaltiPayment = ({ appointmentId }) =>
  axiosInstance.request({
    url: "/payments/khalti/initiate",
    method: "POST",
    data: { appointmentId },
  });

export const verifyKhaltiPayment = ({ pidx, appointmentId }) =>
  axiosInstance.request({
    url: "/payments/khalti/verify",
    method: "POST",
    data: { pidx, appointmentId },
  });
