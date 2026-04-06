const ONBOARDING_DRAFT_KEY = "pethub-onboarding-draft";

export const getOnboardingDraft = () => {
  const rawDraft = localStorage.getItem(ONBOARDING_DRAFT_KEY);

  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft);
  } catch (error) {
    console.error("Failed to parse onboarding draft:", error);
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    return null;
  }
};

export const setOnboardingDraft = (draft) => {
  localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
};

export const clearOnboardingDraft = () => {
  localStorage.removeItem(ONBOARDING_DRAFT_KEY);
};
