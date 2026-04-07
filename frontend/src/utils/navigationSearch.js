const routeRules = [
  {
    path: "/medical-records",
    keywords: ["medical", "record", "records", "health", "lab", "vacc", "treatment"],
  },
  {
    path: "/services",
    keywords: ["service", "booking", "book", "appointment", "vet", "groom", "payment"],
  },
  {
    path: "/dashboard/adoption",
    keywords: ["adopt", "adoption", "pet", "gallery", "foster"],
  },
  {
    path: "/community",
    keywords: ["community", "meetup", "connect", "message", "playdate"],
  },
];

export const resolveSearchPath = (term = "") => {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return "/dashboard";
  }

  const match = routeRules.find(({ keywords }) =>
    keywords.some((keyword) => normalizedTerm.includes(keyword))
  );

  return match?.path ?? "/dashboard";
};
