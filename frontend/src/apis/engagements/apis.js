import { axiosInstance } from "../axios";

export const createEngagementRequest = ({
  type,
  fullName,
  email,
  contactNumber,
  petName,
  title,
  message,
  referenceId,
  metadata,
}) =>
  axiosInstance.request({
    url: "/engagements",
    method: "POST",
    data: {
      type,
      fullName,
      email,
      contactNumber,
      petName,
      title,
      message,
      referenceId,
      metadata,
    },
  });
