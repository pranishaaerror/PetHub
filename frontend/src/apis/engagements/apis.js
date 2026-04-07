import { axiosInstance } from "../axios";

export const createEngagementRequest = (data) =>
  axiosInstance.request({
    url: "/engagements",
    method: "POST",
    data,
  });
