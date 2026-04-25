import { axiosInstance } from "../axios";

export const getCommunityMeetups = ({ approvedOnly = false } = {}) =>
  axiosInstance.request({
    url: "/community/meetups",
    method: "GET",
    params: approvedOnly ? { approvedOnly: "true" } : {},
  });

export const adminCreateMeetup = (data) =>
  axiosInstance.request({ url: "/community/meetups", method: "POST", data });

export const adminUpdateMeetup = ({ meetupId, ...data }) =>
  axiosInstance.request({ url: `/community/meetups/${meetupId}`, method: "PATCH", data });

export const adminDeleteMeetup = ({ meetupId }) =>
  axiosInstance.request({ url: `/community/meetups/${meetupId}`, method: "DELETE" });
