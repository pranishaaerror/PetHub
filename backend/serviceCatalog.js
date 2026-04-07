import Services from "./models/Services.js";

const defaultServices = [
  {
    serviceName: "Vet Consultation",
    slug: "vet-consultation",
    description: "Warm health checks, diagnostics, and comfort-first treatment guidance.",
    price: 1500,
    durationMinutes: 45,
    category: "vet",
    isActive: true,
  },
  {
    serviceName: "Grooming Ritual",
    slug: "grooming-ritual",
    description: "Bathing, coat trim, paw care, and a polished finishing routine.",
    price: 1200,
    durationMinutes: 60,
    category: "grooming",
    isActive: true,
  },
  {
    serviceName: "Vaccination Visit",
    slug: "vaccination-visit",
    description: "Core vaccines, booster planning, and reminder-friendly record updates.",
    price: 900,
    durationMinutes: 30,
    category: "vaccination",
    isActive: true,
  },
  {
    serviceName: "Dental Refresh",
    slug: "dental-refresh",
    description: "Dental check, cleaning support, and gentle gum-health monitoring.",
    price: 1800,
    durationMinutes: 40,
    category: "dental",
    isActive: true,
  },
];

export const ensureDefaultServices = async () => {
  await Promise.all(
    defaultServices.map((service) =>
      Services.findOneAndUpdate(
        { serviceName: service.serviceName },
        { $set: service },
        { upsert: true, new: true, runValidators: true }
      )
    )
  );

  console.log("Default service catalog ensured");
};
