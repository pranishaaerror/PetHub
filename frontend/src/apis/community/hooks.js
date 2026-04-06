import { useMutation, useQuery } from "@tanstack/react-query";
import { getCommunityMeetups, getCommunityPosts, rsvpMeetup, sendCommunityMessage } from "./apis";

export const useCommunityMeetups = () =>
  useQuery({
    queryFn: getCommunityMeetups,
    queryKey: ["community-meetups"],
  });

export const useCommunityPosts = () =>
  useQuery({
    queryFn: getCommunityPosts,
    queryKey: ["community-posts"],
  });

export const useRsvpMeetup = () =>
  useMutation({
    mutationFn: rsvpMeetup,
    mutationKey: ["community-rsvp"],
  });

export const useSendCommunityMessage = () =>
  useMutation({
    mutationFn: sendCommunityMessage,
    mutationKey: ["community-message"],
  });
