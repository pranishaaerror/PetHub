import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Camera,
  Bell,
  Calendar,
  Users,
  Dog,
  Syringe,
  AlertCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PetHubLoader } from "../components/PetHubLoader";
import { StepProgress } from "../components/StepProgress";
import { UploadPetPhotoCard } from "../components/UploadPetPhotoCard";
import {
  useOnboardingStatus,
  useCompleteOnboarding,
  useSaveOnboardingStep,
} from "../apis/onboarding/hooks";
import { useAuth } from "../context/AuthContext";
import {
  clearOnboardingDraft,
  getOnboardingDraft,
  setOnboardingDraft,
} from "../utils/onboardingDraft";
import { resolveRedirectPath } from "../utils/authSession";

const onboardingSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  phoneNumber: z.string().optional(),
  photoDataUrl: z.string().optional(),
  petName: z.string().min(1, "Pet name is required."),
  species: z.string().min(1, "Species is required."),
  breed: z.string().min(1, "Breed is required."),
  gender: z.string().optional(),
  age: z.string().optional(),
  dob: z.string().optional(),
  weight: z.string().optional(),
  color: z.string().optional(),
  microchipId: z.string().optional(),
  vaccinationStatus: z.string().min(1, "Vaccination status is required."),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  preferredClinic: z.string().optional(),
  reminders: z.boolean(),
  bookingInterest: z.boolean(),
  adoptionInterest: z.boolean(),
  communityInterest: z.boolean(),
  notificationPreference: z.string(),
  carePlanPreference: z.string(),
});

const onboardingSteps = [
  {
    title: "Welcome",
    caption: "Meet your premium care companion",
    icon: HeartHandshake,
  },
  {
    title: "Pet Photo",
    caption: "Add a warm face to the profile",
    icon: Camera,
  },
  {
    title: "Pet Details",
    caption: "Set up the basics cleanly",
    icon: Dog,
  },
  {
    title: "Health Basics",
    caption: "Capture care signals early",
    icon: Syringe,
  },
  {
    title: "Preferences",
    caption: "Tune reminders and interests",
    icon: Bell,
  },
  {
    title: "Complete",
    caption: "Review and enter PetHub",
    icon: CheckCircle2,
  },
];

const stepFields = {
  1: ["fullName"],
  2: [],
  3: ["petName", "species", "breed"],
  4: ["vaccinationStatus"],
  5: ["notificationPreference", "carePlanPreference"],
};

const defaultValues = {
  fullName: "",
  phoneNumber: "",
  photoDataUrl: "",
  petName: "",
  species: "Dog",
  breed: "",
  gender: "Female",
  age: "",
  dob: "",
  weight: "",
  color: "",
  microchipId: "",
  vaccinationStatus: "Up to date",
  allergies: "",
  medicalConditions: "",
  medications: "",
  preferredClinic: "",
  reminders: true,
  bookingInterest: true,
  adoptionInterest: true,
  communityInterest: true,
  notificationPreference: "email-and-app",
  carePlanPreference: "balanced",
};

const sectionAnimation = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -24, scale: 0.98 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const PremiumCheckbox = ({ label, description, register, name, icon: Icon }) => (
  <motion.label
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    className="group flex cursor-pointer items-start gap-5 rounded-3xl bg-gradient-to-br from-white to-[#FFFBF5] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(245,166,35,0.08)] hover:ring-1 hover:ring-[#F5A623]/20"
  >
    <div className="relative mt-1">
      <input
        type="checkbox"
        {...register(name)}
        className="peer h-5 w-5 appearance-none rounded-lg border-2 border-[#E2D4C2] bg-white checked:border-[#F5A623] checked:bg-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/30 focus:ring-offset-0"
      />
      <CheckCircle2 className="pointer-events-none absolute left-0 top-0 h-5 w-5 scale-0 text-white transition-all duration-200 peer-checked:scale-100" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-[#F5A623]" />}
        <p className="text-base font-semibold text-[#2D2D2D]">{label}</p>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B6B]">{description}</p>
    </div>
  </motion.label>
);

const PremiumInput = ({
  register,
  name,
  label,
  placeholder,
  type = "text",
  error,
  icon: Icon,
  optional = false,
  max,
  min,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
      {Icon && <Icon className="h-4 w-4 text-[#F5A623]" />}
      {label}
      {optional && (
        <span className="text-xs font-normal text-[#B8A99A]">(Optional)</span>
      )}
    </label>
    <input
      type={type}
      {...register(name)}
      placeholder={placeholder}
      max={max}
      min={min}
      className="w-full rounded-2xl border border-[#F0E5D8] bg-white px-5 py-3.5 text-sm text-[#2D2D2D] outline-none transition-all duration-200 placeholder:text-[#C8BBA8] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
    />
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 text-sm text-[#E88D67]"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        {error.message}
      </motion.p>
    )}
  </div>
);

const PremiumTextArea = ({
  register,
  name,
  label,
  placeholder,
  rows = 3,
  error,
  optional = false,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
      {label}
      {optional && (
        <span className="text-xs font-normal text-[#B8A99A]">(Optional)</span>
      )}
    </label>
    <textarea
      {...register(name)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-[#F0E5D8] bg-white px-5 py-3.5 text-sm text-[#2D2D2D] outline-none transition-all duration-200 placeholder:text-[#C8BBA8] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
    />
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 text-sm text-[#E88D67]"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        {error.message}
      </motion.p>
    )}
  </div>
);

const PremiumSelect = ({ register, name, label, options, error }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-[#5B544C]">{label}</label>
    <select
      {...register(name)}
      className="w-full rounded-2xl border border-[#F0E5D8] bg-white px-5 py-3.5 text-sm text-[#2D2D2D] outline-none transition-all duration-200 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 text-sm text-[#E88D67]"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        {error.message}
      </motion.p>
    )}
  </div>
);

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = resolveRedirectPath(
    searchParams.get("redirect"),
    "/dashboard"
  );
  const { userProfile, refreshUserProfile } = useAuth();
  const {
    data: onboardingResponse,
    isLoading,
    refetch: refetchOnboarding,
  } = useOnboardingStatus();
  const { mutate: saveStepMutation } = useSaveOnboardingStep();
  const { mutateAsync: completeOnboarding, isPending: isCompleting } =
    useCompleteOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [isClearingDraft, setIsClearingDraft] = useState(false);
  const userIdRef = useRef(userProfile?.id);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
  });

  const values = watch();

  useEffect(() => {
    const currentUserId = userProfile?.id;
    if (userIdRef.current && userIdRef.current !== currentUserId) {
      setIsClearingDraft(true);
      clearOnboardingDraft();
      setCurrentStep(1);
      reset(defaultValues);
      setIsDraftReady(false);
      refetchOnboarding();
    }
    userIdRef.current = currentUserId;
  }, [userProfile?.id, reset, refetchOnboarding]);

  useEffect(() => {
    if (!onboardingResponse?.data || isClearingDraft) return;

    if (onboardingResponse.data.onboardingCompleted) {
      navigate(redirectPath, { replace: true });
      return;
    }

    const localDraft = getOnboardingDraft() ?? {};

    const mergedValues = {
      ...defaultValues,
      fullName:
        userProfile?.fullName ||
        userProfile?.displayName ||
        defaultValues.fullName,
      phoneNumber:
        userProfile?.phoneNumber ||
        userProfile?.contactNumber ||
        defaultValues.phoneNumber,
      ...(onboardingResponse.data.onboardingDraft ?? {}),
      ...localDraft,
    };

    reset(mergedValues);

    let initialStep = 1;
    if (localDraft.currentStep) {
      initialStep = localDraft.currentStep;
    } else if (onboardingResponse.data.onboardingStep) {
      initialStep = onboardingResponse.data.onboardingStep;
    } else if (onboardingResponse.data.hasPetProfile) {
      initialStep = 6;
    }

    setCurrentStep(initialStep);
    setIsDraftReady(true);
    setIsClearingDraft(false);
  }, [
    navigate,
    onboardingResponse,
    redirectPath,
    reset,
    userProfile,
    isClearingDraft,
  ]);

  useEffect(() => {
    if (!isDraftReady || isClearingDraft) return;

    const payload = { ...values, currentStep };
    setOnboardingDraft(payload);

    const timeout = setTimeout(() => {
      if (currentStep < 6) {
        saveStepMutation({ step: currentStep, payload });
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [currentStep, isDraftReady, saveStepMutation, values, isClearingDraft]);

  const photoPreview = values.photoDataUrl || "";

  const summaryItems = useMemo(
    () => [
      { label: "Pet Name", value: values.petName || "Your pet", icon: Dog },
      { label: "Species", value: values.species || "Not set", icon: PawPrint },
      { label: "Breed", value: values.breed || "Not set", icon: Sparkles },
      {
        label: "Vaccination",
        value: values.vaccinationStatus || "Not set",
        icon: Syringe,
      },
      {
        label: "Preferred Clinic",
        value: values.preferredClinic || "Open to suggestions",
        icon: Stethoscope,
      },
      {
        label: "Notifications",
        value:
          values.notificationPreference === "email-and-app"
            ? "Email + App"
            : values.notificationPreference === "email-only"
            ? "Email only"
            : "App only",
        icon: Bell,
      },
    ],
    [values]
  );

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue("photoDataUrl", String(reader.result ?? ""), {
        shouldDirty: true,
      });
      toast.success("Pet photo added! It will appear across your dashboard.");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoClear = () => {
    setValue("photoDataUrl", "", { shouldDirty: true });
    toast.info("Photo removed. You can add one later.");
  };

  const handleNext = async () => {
    const fields = stepFields[currentStep] ?? [];
    const isValid = fields.length ? await trigger(fields) : true;

    if (!isValid) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, onboardingSteps.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data) => {
    try {
      const response = await completeOnboarding(data);
      clearOnboardingDraft();
      await refreshUserProfile(true);
      toast.success(response.data?.message || "Welcome to PetHub!");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to complete onboarding"
      );
    }
  };

  if (isLoading || !isDraftReady || isClearingDraft) {
    return (
      <PetHubLoader
        fullScreen
        title="Preparing Your Space"
        message="Setting up your personalized PetHub experience..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EAD9] via-[#F7EFE2] to-[#F4EAD9] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1600px]">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#F5C062] p-2 shadow-lg">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#B78331]">
              Premium Setup
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#F5A623]" />
            <span className="text-sm text-[#6B6B6B]">Secure & Encrypted</span>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          <motion.div {...fadeInUp} className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8F0] to-white p-8 shadow-xl">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F5A623]/5 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#F5A623]/10 px-3 py-1 text-xs font-semibold text-[#F5A623]">
                  <Sparkles className="h-3 w-3" />
                  Premium Onboarding
                </span>
                <h1 className="mt-5 text-4xl font-bold leading-tight text-[#2D2D2D] md:text-5xl">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-[#F5A623] to-[#E8911A] bg-clip-text text-transparent">
                    PetHub
                  </span>
                </h1>
                <p className="mt-4 text-base leading-relaxed text-[#6B6B6B]">
                  Build a warm, intelligent home base for your pet. Your
                  dashboard, reminders, and records come alive with every detail
                  you share.
                </p>
              </div>
            </div>

            <StepProgress steps={onboardingSteps} currentStep={currentStep} />

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Care-First Setup",
                  detail:
                    "Every detail builds a complete PetHub profile, not just a thin form.",
                  icon: Stethoscope,
                },
                {
                  title: "Smart Drafts",
                  detail:
                    "Your progress saves automatically across devices. Continue anytime.",
                  icon: ShieldCheck,
                },
                {
                  title: "Pet-Led Dashboard",
                  detail:
                    "Your pet's photo and details flow into reminders, bookings, and cards.",
                  icon: PawPrint,
                },
                {
                  title: "Premium Experience",
                  detail:
                    "Every interaction feels warm, polished, and thoughtfully designed.",
                  icon: Sparkles,
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group rounded-2xl bg-gradient-to-br from-white to-[#FFFBF5] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(245,166,35,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5A623] to-[#F5C062] shadow-md transition-all duration-300 group-hover:scale-105">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[#2D2D2D]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="overflow-hidden rounded-3xl bg-white/90 shadow-2xl backdrop-blur-sm"
            >
              <div className="border-b border-[#F0E5D8] bg-gradient-to-r from-[#FFFBF5] to-white px-6 py-4">
                <div className="flex items-center gap-2">
                  {onboardingSteps[currentStep - 1]?.icon &&
                    (() => {
                      const IconComp = onboardingSteps[currentStep - 1].icon;
                      return <IconComp className="h-5 w-5 text-[#F5A623]" />;
                    })()}
                  <span className="text-sm font-semibold uppercase tracking-wider text-[#B78331]">
                    Step {currentStep} of {onboardingSteps.length}
                  </span>
                </div>
                <h2 className="mt-1 text-2xl font-bold text-[#2D2D2D]">
                  {onboardingSteps[currentStep - 1].title}
                </h2>
                <p className="text-sm text-[#6B6B6B]">
                  {onboardingSteps[currentStep - 1].caption}
                </p>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    {...sectionAnimation}
                    className="min-h-[560px]"
                  >

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                          <PremiumInput
                            register={register}
                            name="fullName"
                            label="Full Name"
                            placeholder="Your full name"
                            icon={HeartHandshake}
                            error={errors.fullName}
                          />
                          <PremiumInput
                            register={register}
                            name="phoneNumber"
                            label="Phone Number"
                            placeholder="+977 98XXXXXXXX"
                            icon={Bell}
                            optional
                          />
                        </div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-6 rounded-2xl bg-gradient-to-br from-[#FFF8F0] to-white p-6 shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[#F5A623]/10 p-3">
                              <HeartHandshake className="h-6 w-6 text-[#F5A623]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-[#B78331]">
                                Why PetHub Feels Better
                              </p>
                              <p className="mt-2 text-lg font-semibold text-[#2D2D2D]">
                                Luxury care structure, no cold complexity
                              </p>
                              <div className="mt-4 space-y-2 text-sm text-[#6B6B6B]">
                                <p className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                                  Health reminders attached to your pet's profile
                                </p>
                                <p className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                                  Bookings, adoption, community — all connected
                                </p>
                                <p className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                                  Your setup saves, so you never lose momentum
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <UploadPetPhotoCard
                          photoPreview={photoPreview}
                          onFileSelect={handlePhotoSelect}
                          onClear={handlePhotoClear}
                          helperText="Upload a clear, friendly photo. This will appear across your dashboard, booking summaries, and profile cards."
                        />
                        <div className="rounded-2xl bg-[#FFF8F0] p-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-[#6B6B6B]">
                            <Sparkles className="h-4 w-4 text-[#F5A623]" />
                            A pet photo makes your dashboard 3x more personal. You can always update it later.
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <PremiumInput
                            register={register}
                            name="petName"
                            label="Pet Name"
                            placeholder="Nori, Luna, Max..."
                            icon={Dog}
                            error={errors.petName}
                          />
                          <PremiumInput
                            register={register}
                            name="species"
                            label="Species"
                            placeholder="Dog, Cat, Bird..."
                            error={errors.species}
                          />
                          <PremiumInput
                            register={register}
                            name="breed"
                            label="Breed"
                            placeholder="Shiba Inu, Persian..."
                            error={errors.breed}
                          />
                          <PremiumInput
                            register={register}
                            name="gender"
                            label="Gender"
                            placeholder="Female / Male"
                            optional
                          />
                          <PremiumInput
                            register={register}
                            name="age"
                            label="Age"
                            placeholder="3 years"
                            optional
                          />
                          <PremiumInput
                            register={register}
                            name="dob"
                            label="Date of Birth"
                            type="date"
                            max={new Date().toISOString().slice(0, 10)}
                            optional
                          />
                          <PremiumInput
                            register={register}
                            name="weight"
                            label="Weight"
                            placeholder="12 kg"
                            optional
                          />
                          <PremiumInput
                            register={register}
                            name="color"
                            label="Color"
                            placeholder="Golden cream"
                            optional
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-5">
                        <PremiumSelect
                          register={register}
                          name="vaccinationStatus"
                          label="Vaccination Status"
                          options={[
                            { value: "Up to date", label: "Up to date" },
                            { value: "Needs review", label: "Needs review" },
                            { value: "In progress", label: "In progress" },
                          ]}
                          error={errors.vaccinationStatus}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <PremiumTextArea
                            register={register}
                            name="allergies"
                            label="Allergies"
                            placeholder="Chicken, pollen, certain shampoos..."
                            optional
                          />
                          <PremiumTextArea
                            register={register}
                            name="medicalConditions"
                            label="Medical Conditions"
                            placeholder="Sensitive digestion, skin issues..."
                            optional
                          />
                          <PremiumTextArea
                            register={register}
                            name="medications"
                            label="Medications"
                            placeholder="Omega supplements, allergy tablets..."
                            optional
                          />
                          <PremiumInput
                            register={register}
                            name="preferredClinic"
                            label="Preferred Clinic"
                            placeholder="Optional clinic preference"
                            optional
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <PremiumCheckbox
                            label="Smart Reminders"
                            description="Keep vaccination, booking, and health nudges active. Never miss a care moment."
                            register={register}
                            name="reminders"
                            icon={Bell}
                          />
                          <PremiumCheckbox
                            label="Booking Interest"
                            description="Show more care and service shortcuts around appointments."
                            register={register}
                            name="bookingInterest"
                            icon={Calendar}
                          />
                          <PremiumCheckbox
                            label="Adoption Interest"
                            description="Highlight adoption stories and matching pets where helpful."
                            register={register}
                            name="adoptionInterest"
                            icon={HeartHandshake}
                          />
                          <PremiumCheckbox
                            label="Community Interest"
                            description="Surface meetups, playdates, and warm introductions more often."
                            register={register}
                            name="communityInterest"
                            icon={Users}
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 6 && (
                      <div className="space-y-6">
                        <div className="rounded-2xl bg-gradient-to-br from-[#FFF8F0] to-white p-5">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#F5A623]/10 p-2">
                              <CheckCircle2 className="h-6 w-6 text-[#F5A623]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#B78331]">
                                Ready to Launch
                              </p>
                              <p className="text-lg font-bold text-[#2D2D2D]">
                                Review your setup
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF8F0] to-white shadow-md">
                            <div className="relative h-48 w-full overflow-hidden bg-[#F0E5D8]">
                              {photoPreview ? (
                                <img
                                  src={photoPreview}
                                  alt={values.petName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <PawPrint className="h-16 w-16 text-[#D4C5B0]" />
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                <p className="text-xl font-bold text-white">
                                  {values.petName || "Your Pet"}
                                </p>
                                <p className="text-sm text-white/80">
                                  {values.breed || "Breed"} •{" "}
                                  {values.species || "Species"}
                                </p>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-center text-sm text-[#6B6B6B]">
                                Primary Pet Profile
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {summaryItems.map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                              >
                                <div className="rounded-lg bg-[#F5A623]/10 p-2">
                                  {item.icon && (
                                    <item.icon className="h-4 w-4 text-[#F5A623]" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-[#8B7B66]">
                                    {item.label}
                                  </p>
                                  <p className="text-sm font-semibold text-[#2D2D2D]">
                                    {item.value}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-r from-[#F5A623]/10 to-transparent p-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-[#6B6B6B]">
                            <Sparkles className="h-4 w-4 text-[#F5A623]" />
                            Your dashboard will open with personalized recommendations, care reminders, and a complete pet profile.
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="border-t border-[#F0E5D8] bg-[#FFFBF5] px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2D4C2] bg-white px-6 py-2.5 text-sm font-semibold text-[#5B544C] transition-all duration-200 hover:border-[#F5A623] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </motion.button>

                  {currentStep < onboardingSteps.length ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleNext}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#E8911A] px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isCompleting}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#2D2D2D] to-[#1a1a1a] px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isCompleting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          Enter PetHub
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};