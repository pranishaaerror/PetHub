import dog from "../assets/dog.jpg";
import signupDog from "../assets/dogsignup.jpg";
import landingDog from "../assets/landingpagedog.png";

export const adoptionFilters = ["All", "Dogs", "Cats", "Exotic"];

const galleryImages = [dog, signupDog, landingDog];
const carouselPalette = [
  "245,166,35",
  "255,179,71",
  "255,211,150",
  "214,160,73",
  "196,124,29",
  "255,227,179",
];
const locations = [
  "Lalitpur Care Lounge",
  "Kathmandu Foster Home",
  "Bhaktapur Recovery Suite",
  "Patan Paw House",
];
const summaries = [
  "A bright companion with a soft routine, ready for a home that values patience, consistency, and playtime.",
  "This gentle soul settles best around calm voices, cozy corners, and a guardian who loves slow trust-building.",
  "A sweet pet with a curious rhythm, warm eye contact, and the kind of energy that fills a home softly.",
  "Friendly, observant, and quietly affectionate, with a lovely balance of rest, play, and companionship.",
];
const temperaments = [
  "Calm and affectionate",
  "Curious and gentle",
  "Playful with soft energy",
  "Shy at first, loving after trust",
];
const careNotes = [
  "Prefers a soft transition, steady feeding routine, and relaxed introductions.",
  "Loves short play sessions, clean bedding, and a patient hand during new experiences.",
  "Does well with familiar sounds, a tidy rest corner, and daily check-ins.",
  "Needs a warm first week, a predictable walk or play rhythm, and low-stress greetings.",
];
const landingPreviewPets = [
  { _id: "preview-nori", petName: "Nori", breed: "Shiba Mix", age: "3 years", gender: "Female", intakeDate: new Date().toISOString(), status: "Available" },
  { _id: "preview-mochi", petName: "Mochi", breed: "Golden Retriever", age: "2 years", gender: "Male", intakeDate: new Date().toISOString(), status: "Available" },
  { _id: "preview-luna", petName: "Luna", breed: "Persian Cat", age: "1 year", gender: "Female", intakeDate: new Date().toISOString(), status: "Pending" },
  { _id: "preview-koko", petName: "Koko", breed: "Beagle", age: "4 years", gender: "Male", intakeDate: new Date().toISOString(), status: "Available" },
  { _id: "preview-mimi", petName: "Mimi", breed: "Siamese Cat", age: "2 years", gender: "Female", intakeDate: new Date().toISOString(), status: "Available" },
  { _id: "preview-pika", petName: "Pika", breed: "Rabbit", age: "1 year", gender: "Male", intakeDate: new Date().toISOString(), status: "Available" },
];

const hashValue = (value = "") =>
  Array.from(value).reduce(
    (total, char, index) => total + char.charCodeAt(0) * (index + 1),
    0
  );

export const inferSpecies = (breed = "", seed = 0) => {
  const normalizedBreed = String(breed).toLowerCase();

  if (
    [
      "retriever",
      "beagle",
      "husky",
      "shepherd",
      "labrador",
      "pug",
      "terrier",
      "shiba",
      "spaniel",
      "dog",
    ].some((tag) => normalizedBreed.includes(tag))
  ) {
    return "Dogs";
  }

  if (
    ["persian", "siamese", "maine", "bengal", "ragdoll", "cat"].some((tag) =>
      normalizedBreed.includes(tag)
    )
  ) {
    return "Cats";
  }

  return seed % 3 === 0 ? "Dogs" : seed % 3 === 1 ? "Cats" : "Exotic";
};

export const mapStatusLabel = (status) => {
  if (status === "Pending") {
    return "Medical Hold";
  }

  return status;
};

export const decorateAdoptionPet = (pet) => {
  if (!pet) {
    return null;
  }

  const seed = hashValue(pet._id || `${pet.petName}-${pet.breed}`);
  const image =
    pet.imageGallery?.[0] ||
    pet.photoUrl ||
    pet.image ||
    galleryImages[seed % galleryImages.length];
  const accent = carouselPalette[seed % carouselPalette.length];
  const petName = pet.petName || pet.name || "Pet";
  const summary = pet.description || summaries[seed % summaries.length];
  const location = pet.location || locations[seed % locations.length];
  const temperamentList = Array.isArray(pet.temperament) ? pet.temperament : [];

  return {
    ...pet,
    petName,
    species: inferSpecies(pet.breed, seed),
    displayStatus: mapStatusLabel(pet.status),
    image,
    accent,
    location,
    summary,
    temperament: temperamentList.length
      ? temperamentList.join(", ")
      : temperaments[seed % temperaments.length],
    careNote: careNotes[seed % careNotes.length],
  };
};

export const decorateAdoptionPets = (pets = []) => pets.map((pet) => decorateAdoptionPet(pet));

export const getLandingOrbitPets = (pets = []) =>
  decorateAdoptionPets(pets.length ? pets : landingPreviewPets);
