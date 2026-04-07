import Adoption from "./models/Adoption.js";

const defaultAdoptionPets = [
  {
    petName: "Nori",
    breed: "Shiba Mix",
    age: "3 years",
    gender: "Female",
    intakeDate: "2026-03-22T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Mochi",
    breed: "Golden Retriever",
    age: "2 years",
    gender: "Male",
    intakeDate: "2026-03-21T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Luna",
    breed: "Persian Cat",
    age: "1 year",
    gender: "Female",
    intakeDate: "2026-03-20T09:00:00.000Z",
    status: "Pending",
  },
  {
    petName: "Koko",
    breed: "Beagle",
    age: "4 years",
    gender: "Male",
    intakeDate: "2026-03-19T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Mimi",
    breed: "Siamese Cat",
    age: "2 years",
    gender: "Female",
    intakeDate: "2026-03-18T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Pika",
    breed: "Rabbit",
    age: "1 year",
    gender: "Male",
    intakeDate: "2026-03-17T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Toby",
    breed: "Labrador Retriever",
    age: "5 years",
    gender: "Male",
    intakeDate: "2026-03-16T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Cleo",
    breed: "Bengal Cat",
    age: "2 years",
    gender: "Female",
    intakeDate: "2026-03-15T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Oreo",
    breed: "Pug",
    age: "18 months",
    gender: "Male",
    intakeDate: "2026-03-14T09:00:00.000Z",
    status: "Pending",
  },
  {
    petName: "Zuzu",
    breed: "Cockatiel",
    age: "11 months",
    gender: "Female",
    intakeDate: "2026-03-13T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Rumi",
    breed: "Husky Mix",
    age: "3 years",
    gender: "Female",
    intakeDate: "2026-03-12T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Suki",
    breed: "Maine Coon",
    age: "4 years",
    gender: "Female",
    intakeDate: "2026-03-11T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Bruno",
    breed: "German Shepherd",
    age: "6 years",
    gender: "Male",
    intakeDate: "2026-03-10T09:00:00.000Z",
    status: "Adopted",
  },
  {
    petName: "Peaches",
    breed: "Ragdoll Cat",
    age: "18 months",
    gender: "Female",
    intakeDate: "2026-03-09T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Maple",
    breed: "Corgi",
    age: "2 years",
    gender: "Female",
    intakeDate: "2026-03-08T09:00:00.000Z",
    status: "Available",
  },
  {
    petName: "Nova",
    breed: "Parakeet",
    age: "9 months",
    gender: "Male",
    intakeDate: "2026-03-07T09:00:00.000Z",
    status: "Available",
  },
];

export const ensureDefaultAdoptionPets = async () => {
  await Promise.all(
    defaultAdoptionPets.map((pet) =>
      Adoption.findOneAndUpdate(
        { petName: pet.petName, breed: pet.breed },
        { $set: pet },
        { upsert: true, new: true, runValidators: true }
      )
    )
  );

  console.log("Default adoption pets ensured");
};
