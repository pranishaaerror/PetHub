export const getPasswordStrength = (password = "") => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return {
      label: "Needs work",
      width: "32%",
      tone: "bg-[#E7B76D]",
      message: "Use uppercase, lowercase, number, and symbol for a stronger password.",
    };
  }

  if (score === 3 || score === 4) {
    return {
      label: "Strong",
      width: "72%",
      tone: "bg-[#F5A623]",
      message: "Good start. One more complexity boost makes it even better.",
    };
  }

  return {
    label: "Excellent",
    width: "100%",
    tone: "bg-[#D99221]",
    message: "This password looks premium and resilient.",
  };
};
