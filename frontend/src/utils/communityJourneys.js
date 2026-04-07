export const featuredMeetup = {
  slug: "garden-brunch",
  eyebrow: "Featured meetup",
  title: "Garden brunch and off-leash social in the city this Sunday.",
  summary:
    "Meet fellow pet parents, share nutrition tips, and let your companions explore a calm, supervised play pocket with photo moments and hydration stations.",
  time: "Sunday, 11:00 AM",
  location: "Patan Garden Courts",
  host: "PetHub Community Desk",
  capacity: "24 families",
  vibe: "Warm, social, premium",
  agenda: [
    "Welcome circle with pet-parent introductions and calm-arrival tips.",
    "Supervised off-leash lane with hydration and shaded rest spots.",
    "Mini care talk on seasonal diet changes and soft social routines.",
  ],
};

export const communityStats = [
  { value: "18", label: "Nearby playdate circles" },
  { value: "142", label: "Parents active this month" },
  { value: "09", label: "Upcoming wellness meetups" },
];

export const communityPlaydates = [
  {
    slug: "sunrise-walk-club",
    title: "Sunrise Walk Club",
    detail:
      "Slow-start strolls for shy pups and chatty pet parents around Jawalakhel.",
    time: "Tomorrow, 7:00 AM",
    mood: "Gentle energy",
    location: "Jawalakhel Loop",
  },
  {
    slug: "indoor-cat-parent-circle",
    title: "Indoor Cat Parent Circle",
    detail:
      "Enrichment swaps, litter setup ideas, and cozy apartment-friendly routines.",
    time: "Friday, 5:30 PM",
    mood: "Quiet and curious",
    location: "Lalitpur Lounge",
  },
  {
    slug: "puppy-social-hour",
    title: "Puppy Social Hour",
    detail:
      "Confidence-building games, trainer tips, and a supervised mini obstacle lane.",
    time: "Saturday, 4:00 PM",
    mood: "Bright and playful",
    location: "PetHub Park Pocket",
  },
];

export const findCommunityJourney = (slug) => {
  if (!slug) {
    return null;
  }

  if (slug === featuredMeetup.slug) {
    return featuredMeetup;
  }

  return communityPlaydates.find((item) => item.slug === slug) ?? null;
};

export const communityConversationModes = {
  message: {
    label: "Message",
    title: "Send a thoughtful message",
    intro:
      "Open the conversation with a clear note about timing, personality, and what kind of meetup feels right.",
  },
  connect: {
    label: "Connect",
    title: "Request a warm connection",
    intro:
      "Let PetHub set the tone with a friendly introduction and the right expectation from the start.",
  },
  "warm-intro": {
    label: "Warm Intro",
    title: "Start a warm intro",
    intro:
      "Share a little about your pet, your energy level, and the kind of connection you hope to make.",
  },
};
