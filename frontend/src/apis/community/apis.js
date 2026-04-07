import { axiosInstance } from "../axios";

export const getCommunityMeetups = ({ approvedOnly = false } = {}) =>
  axiosInstance.request({
    url: "/community/meetups",
    method: "GET",
    params: approvedOnly ? { approvedOnly: "true" } : {},
  });
