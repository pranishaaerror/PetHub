import Services from "./models/Services.js";

// No default services — admin adds all services manually via the admin panel.
export const ensureDefaultServices = async () => {
  console.log("Service catalog: no default seed data.");
};
