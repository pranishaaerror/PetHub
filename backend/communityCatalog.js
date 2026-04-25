import CommunityMeetup from "./models/CommunityMeetup.js";

// No default meetups — admin adds all events manually via the admin panel.
export const ensureDefaultCommunityMeetups = async () => {
  console.log("Community catalog: no default seed data.");
};
