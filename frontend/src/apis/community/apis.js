import { axiosInstance } from "../axios";

export const getCommunityMeetups = () =>
  axiosInstance.request({
    url: "/community/meetups",
    method: "GET",
  });

export const getCommunityPosts = () =>
  axiosInstance.request({
    url: "/community/posts",
    method: "GET",
  });

export const rsvpMeetup = ({ meetupId }) =>
  axiosInstance.request({
    url: "/community/rsvp",
    method: "POST",
    data: { meetupId },
  });

export const sendCommunityMessage = ({ title, message }) =>
  axiosInstance.request({
    url: "/community/message",
    method: "POST",
    data: { title, message },
  });
