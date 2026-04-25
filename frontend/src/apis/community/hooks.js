import { useMutation, useQuery } from "@tanstack/react-query";
import { adminCreateMeetup, adminDeleteMeetup, adminUpdateMeetup, getCommunityMeetups } from "./apis";

export const useCommunityMeetups = (options = {}) =>
  useQuery({
    queryFn: () => getCommunityMeetups(options),
    queryKey: ["community-meetups", options.approvedOnly],
  });

export const useAdminCreateMeetup = () =>
  useMutation({ mutationFn: adminCreateMeetup, mutationKey: ["admin-create-meetup"] });

export const useAdminUpdateMeetup = () =>
  useMutation({ mutationFn: adminUpdateMeetup, mutationKey: ["admin-update-meetup"] });

export const useAdminDeleteMeetup = () =>
  useMutation({ mutationFn: adminDeleteMeetup, mutationKey: ["admin-delete-meetup"] });
