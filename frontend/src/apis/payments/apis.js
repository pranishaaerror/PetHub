import { axiosInstance } from "../axios";

export const initiateEsewaPayment = ({ appointmentId }) =>
  axiosInstance.request({
    url: "/payments/esewa/initiate",
    method: "POST",
    data: {
      appointmentId,
    },
  });
