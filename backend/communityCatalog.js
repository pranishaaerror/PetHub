import CommunityMeetup from "./models/CommunityMeetup.js";

const defaultCommunityMeetups = [
  {
    title: "Garden Brunch and Off-Leash Social",
    description:
      "A warm city meetup with soft introductions, hydration corners, and a premium pet-parent brunch rhythm.",
    type: "meetup",
    date: "Sunday, April 6",
    time: "11:00 AM",
    location: "Patan Garden Courts",
    hostName: "PetHub Community Desk",
    tags: ["featured", "brunch", "social"],
    energyStyle: "gentle",
  },
  {
    title: "Sunrise Walk Club",
    description:
      "Slow-start strolls for shy pups and easygoing pet parents who enjoy quiet mornings.",
    type: "playdate",
    date: "Tomorrow",
    time: "7:00 AM",
    location: "Jawalakhel Loop",
    hostName: "Dipesh Mahato Tharu",
    tags: ["walk", "calm", "morning"],
    energyStyle: "gentle",
  },
  {
    title: "Indoor Cat Parent Circle",
    description:
      "Apartment-friendly enrichment ideas, litter setup swaps, and quieter community conversation.",
    type: "discussion",
    date: "Friday",
    time: "5:30 PM",
    location: "Lalitpur Lounge",
    hostName: "PetHub Community Desk",
    tags: ["cats", "discussion", "indoors"],
    energyStyle: "quiet",
  },
  {
    title: "Puppy Social Hour",
    description:
      "Confidence-building games, trainer tips, and a bright energy playdate for younger companions.",
    type: "playdate",
    date: "Saturday",
    time: "4:00 PM",
    location: "PetHub Park Pocket",
    hostName: "Aarya Gurung",
    tags: ["puppy", "playdate", "training"],
    energyStyle: "playful",
  },
];

export const ensureDefaultCommunityMeetups = async () => {
  await Promise.all(
    defaultCommunityMeetups.map((item) =>
      CommunityMeetup.findOneAndUpdate(
        { title: item.title, location: item.location },
        { $set: item },
        { upsert: true, new: true, runValidators: true }
      )
    )
  );

  console.log("Default community meetups ensured");
};
