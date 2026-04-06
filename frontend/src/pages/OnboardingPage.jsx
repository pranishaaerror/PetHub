import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@headlessui/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PetHubLoader } from "../components/PetHubLoader";
import { StepProgress } from "../components/StepProgress";
import { UploadPetPhotoCard } from "../components/UploadPetPhotoCard";
import { useOnboardingStatus, useCompleteOnboarding, useSaveOnboardingStep } from "../apis/onboarding/hooks";
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
  },
  {
    title: "Pet Photo",
    caption: "Add a warm face to the profile",
  },
  {
    title: "Pet Details",
    caption: "Set up the basics cleanly",
  },
  {
    title: "Health Basics",
    caption: "Capture care signals early",
  },
  {
    title: "Preferences",
    caption: "Tune reminders and interests",
  },
  {
    title: "Complete",
    caption: "Review and enter PetHub",
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
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const CheckboxField = ({ label, description, register, name }) => (
  <label className="flex items-start gap-4 rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
    <input type="checkbox" {...register(name)} className="mt-1 h-5 w-5 accent-[#F5A623]" />
    <div>
      <p className="text-base font-semibold">{label}</p>
      <p className="mt-1 text-sm leading-7 text-[#6B6B6B]">{description}</p>
    </div>
  </label>
);

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = resolveRedirectPath(searchParams.get("redirect"), "/dashboard");
  const { userProfile, refreshUserProfile } = useAuth();
  const { data: onboardingResponse, isLoading } = useOnboardingStatus();
  const { mutate: saveStepMutation } = useSaveOnboardingStep();
  const { mutateAsync: completeOnboarding, isPending: isCompleting } = useCompleteOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraftReady, setIsDraftReady] = useState(false);

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
    if (!onboardingResponse?.data) {
      return;
    }

    if (onboardingResponse.data.onboardingCompleted) {
      navigate(redirectPath, { replace: true });
      return;
    }

    const localDraft = getOnboardingDraft() ?? {};
    const mergedValues = {
      ...defaultValues,
      fullName: userProfile?.fullName || userProfile?.displayName || defaultValues.fullName,
      phoneNumber:
        userProfile?.phoneNumber || userProfile?.contactNumber || defaultValues.phoneNumber,
      ...(onboardingResponse.data.onboardingDraft ?? {}),
      ...localDraft,
    };

    reset(mergedValues);
    setCurrentStep(
      localDraft.currentStep ??
        onboardingResponse.data.onboardingStep ??
        (onboardingResponse.data.hasPetProfile ? 6 : 1)
    );
    setIsDraftReady(true);
  }, [navigate, onboardingResponse, redirectPath, reset, userProfile]);

  useEffect(() => {
    if (!isDraftReady) {
      return;
    }

    const payload = {
      ...values,
      currentStep,
    };

    setOnboardingDraft(payload);

    const timeout = setTimeout(() => {
      if (currentStep < 6) {
        saveStepMutation({
          step: currentStep,
          payload,
        });
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [currentStep, isDraftReady, saveStepMutation, values]);

  const photoPreview = values.photoDataUrl || userProfile?.avatar || "";

  const summaryItems = useMemo(
    () => [
      { label: "Pet", value: values.petName || "Your pet" },
      { label: "Species", value: values.species || "Not set" },
      { label: "Breed", value: values.breed || "Not set" },
      { label: "Vaccination", value: values.vaccinationStatus || "Not set" },
      { label: "Preferred clinic", value: values.preferredClinic || "Open to suggestions" },
      {
        label: "Notification style",
        value:
          values.notificationPreference === "email-and-app"
            ? "Email + in-app"
            : values.notificationPreference,
      },
    ],
    [values]
  );

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue("photoDataUrl", String(reader.result ?? ""), { shouldDirty: true });
      toast.success("Pet photo added to your onboarding draft.");
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    const fields = stepFields[currentStep] ?? [];
    const isValid = fields.length ? await trigger(fields) : true;

    if (!isValid) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, onboardingSteps.length));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      const response = await completeOnboarding(data);
      clearOnboardingDraft();
      await refreshUserProfile(true);
      toast.success(response.data?.message || "Welcome to PetHub.");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isLoading || !isDraftReady) {
    return (
      <PetHubLoader
        fullScreen
        title="Preparing Onboarding"
        message="Preparing your PetHub setup flow and restoring your saved progress."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
      <div className="mx-auto max-w-[1500px] rounded-[36px] bg-white/60 p-4 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl md:p-6 lg:p-7">
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6 shadow-[0_20px_45px_rgba(45,45,45,0.05)]">
              <span className="pet-chip">PetHub Onboarding</span>
              <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                Build a warm home base for your pet in a few polished steps.
              </h1>
              <p className="mt-4 text-base leading-8 text-[#6B6B6B]">
                Your draft stays saved, your pet photo appears across the platform, and your
                dashboard opens fully prepared for records, bookings, adoption, and reminders.
              </p>
            </div>

            <StepProgress steps={onboardingSteps} currentStep={currentStep} />

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Care-first setup",
                  detail: "We turn your first setup into a complete PetHub profile instead of a thin form.",
                  icon: Stethoscope,
                },
                {
                  title: "Drafts stay safe",
                  detail: "Refreshes and later returns keep your onboarding progress ready to continue.",
                  icon: ShieldCheck,
                },
                {
                  title: "Pet-led dashboard",
                  detail: "The uploaded photo and profile details travel into reminders, bookings, and profile cards.",
                  icon: PawPrint,
                },
                {
                  title: "Warm premium feel",
                  detail: "Every step stays soft, rounded, premium, and mobile friendly.",
                  icon: Sparkles,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="rounded-[34px] bg-white/86 p-6 shadow-[0_24px_60px_rgba(45,45,45,0.08)] md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} {...sectionAnimation} className="min-h-[640px]">
                {currentStep === 1 ? (
                  <div>
                    <span className="pet-chip">Welcome</span>
                    <h2 className="mt-4 text-3xl font-bold">A calmer way to start your PetHub journey.</h2>
                    <p className="mt-4 text-sm leading-8 text-[#6B6B6B]">
                      Set up your pet profile once, then move through bookings, records, adoption,
                      community, reminders, and notifications with one consistent warm experience.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Full name</span>
                        <input
                          {...register("fullName")}
                          placeholder="Your full name"
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        />
                        {errors.fullName ? (
                          <span className="mt-2 block text-sm text-[#C45F3E]">{errors.fullName.message}</span>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Phone number</span>
                        <input
                          {...register("phoneNumber")}
                          placeholder="+977 98XXXXXXXX"
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        />
                      </label>
                    </div>

                    <div className="mt-8 rounded-[28px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                          <HeartHandshake className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                            Why PetHub feels better
                          </p>
                          <p className="mt-1 text-2xl font-bold">Luxury care structure without cold complexity</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3 text-sm leading-7 text-[#6B6B6B]">
                        <p>Health reminders stay attached to your actual pet profile.</p>
                        <p>Bookings, adoption requests, community moments, and notifications feel connected.</p>
                        <p>Your setup stays saved, so you can continue later without losing momentum.</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentStep === 2 ? (
                  <UploadPetPhotoCard
                    photoPreview={photoPreview}
                    onFileSelect={handlePhotoSelect}
                    onClear={() => setValue("photoDataUrl", "", { shouldDirty: true })}
                    helperText="Use a bright, friendly photo. You can also skip for now and keep a soft default until later."
                  />
                ) : null}

                {currentStep === 3 ? (
                  <div>
                    <span className="pet-chip">Pet Basics</span>
                    <h2 className="mt-4 text-3xl font-bold">Tell us about your pet.</h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      {[
                        { name: "petName", label: "Pet name", placeholder: "Nori" },
                        { name: "species", label: "Species", placeholder: "Dog" },
                        { name: "breed", label: "Breed", placeholder: "Shiba Mix" },
                        { name: "gender", label: "Gender", placeholder: "Female" },
                        { name: "age", label: "Age", placeholder: "3 years" },
                        { name: "dob", label: "Date of birth", placeholder: "" },
                        { name: "weight", label: "Weight", placeholder: "12 kg" },
                        { name: "color", label: "Color", placeholder: "Golden cream" },
                        { name: "microchipId", label: "Microchip ID", placeholder: "Optional" },
                      ].map((field) => (
                        <label key={field.name} className="block">
                          <span className="mb-2 block text-sm font-semibold text-[#5B544C]">{field.label}</span>
                          <input
                            type={field.name === "dob" ? "date" : "text"}
                            {...register(field.name)}
                            placeholder={field.placeholder}
                            className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                          />
                          {errors[field.name] ? (
                            <span className="mt-2 block text-sm text-[#C45F3E]">
                              {errors[field.name]?.message}
                            </span>
                          ) : null}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {currentStep === 4 ? (
                  <div>
                    <span className="pet-chip">Health Basics</span>
                    <h2 className="mt-4 text-3xl font-bold">Capture the care details that matter most.</h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Vaccination status</span>
                        <select
                          {...register("vaccinationStatus")}
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        >
                          <option value="Up to date">Up to date</option>
                          <option value="Needs review">Needs review</option>
                          <option value="In progress">In progress</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Allergies</span>
                        <textarea
                          {...register("allergies")}
                          rows={4}
                          placeholder="Chicken, pollen, certain shampoos..."
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Medical conditions</span>
                        <textarea
                          {...register("medicalConditions")}
                          rows={4}
                          placeholder="Sensitive digestion, skin issues..."
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Medications</span>
                        <textarea
                          {...register("medications")}
                          rows={4}
                          placeholder="Omega supplements, allergy tablets..."
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Preferred clinic</span>
                        <input
                          {...register("preferredClinic")}
                          placeholder="Optional clinic preference"
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        />
                      </label>
                    </div>
                  </div>
                ) : null}

                {currentStep === 5 ? (
                  <div>
                    <span className="pet-chip">Preferences</span>
                    <h2 className="mt-4 text-3xl font-bold">Shape how PetHub supports you next.</h2>
                    <div className="mt-8 grid gap-4">
                      <CheckboxField
                        label="Reminders on"
                        description="Keep vaccination, booking, and health nudges active."
                        register={register}
                        name="reminders"
                      />
                      <CheckboxField
                        label="Booking interest"
                        description="Show more care and service shortcuts around appointments."
                        register={register}
                        name="bookingInterest"
                      />
                      <CheckboxField
                        label="Adoption interest"
                        description="Highlight adoption stories and matching pets where helpful."
                        register={register}
                        name="adoptionInterest"
                      />
                      <CheckboxField
                        label="Community interest"
                        description="Surface meetups, playdates, and warm introductions more often."
                        register={register}
                        name="communityInterest"
                      />
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Notification preference</span>
                        <select
                          {...register("notificationPreference")}
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        >
                          <option value="email-and-app">Email and in-app</option>
                          <option value="email-only">Email only</option>
                          <option value="app-only">In-app only</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Care plan preference</span>
                        <select
                          {...register("carePlanPreference")}
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        >
                          <option value="balanced">Balanced</option>
                          <option value="wellness-first">Wellness first</option>
                          <option value="concierge-premium">Concierge premium</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}

                {currentStep === 6 ? (
                  <div>
                    <span className="pet-chip">Complete</span>
                    <h2 className="mt-4 text-3xl font-bold">Your PetHub space is ready to open.</h2>
                    <p className="mt-4 text-sm leading-8 text-[#6B6B6B]">
                      Review the essentials below, then finish setup to unlock your dashboard,
                      profile, records, booking flow, adoption requests, and notifications.
                    </p>

                    <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
                      <div className="rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt={values.petName || "Pet"}
                            className="h-72 w-full rounded-[24px] object-cover"
                          />
                        ) : (
                          <div className="flex h-72 items-center justify-center rounded-[24px] bg-[#FFF0D6] text-[#F5A623]">
                            <PawPrint className="h-12 w-12" />
                          </div>
                        )}
                        <div className="mt-5 rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B78331]">Profile ready</p>
                          <p className="mt-2 text-2xl font-bold">{values.petName || "Your pet"}</p>
                          <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                            {values.breed || "Breed"} • {values.species || "Species"} • {values.age || "Age to be updated"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {summaryItems.map((item) => (
                            <div
                              key={item.label}
                              className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]"
                            >
                              <p className="text-sm text-[#8B7B66]">{item.label}</p>
                              <p className="mt-2 text-lg font-semibold">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-[#F5A623]" />
                            <p className="text-xl font-bold">What happens next</p>
                          </div>
                          <div className="mt-4 space-y-3 text-sm leading-7 text-[#6B6B6B]">
                            <p>Your pet photo and profile appear across dashboard, profile, and booking summaries.</p>
                            <p>Notifications and reminders are enabled using your selected preference mix.</p>
                            <p>You can add more pets later while keeping this one as your current primary profile.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="pet-button-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <ArrowLeft className="h-4 w-4 text-[#F5A623]" />
                Back
              </Button>

              <div className="flex gap-3">
                {currentStep < onboardingSteps.length ? (
                  <Button type="button" onClick={handleNext} className="pet-button-primary gap-2">
                    Save and continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isCompleting} className="pet-button-primary gap-2">
                    {isCompleting ? "Finishing setup..." : "Enter PetHub"}
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
