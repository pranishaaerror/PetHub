import { useQuery } from "@tanstack/react-query";
import { getCommunityMeetups } from "./apis";

export const useCommunityMeetups = (options = {}) =>
  useQuery({
    queryFn: () => getCommunityMeetups(options),
    queryKey: ["community-meetups", options.approvedOnly],
  });
