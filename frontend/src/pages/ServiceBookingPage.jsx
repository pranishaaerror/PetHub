import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Hash,
  NotebookPen,
  PawPrint,
  Phone,
  Scissors,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Syringe,
  WalletCards,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useCreateAppointment, useAppointment } from "../apis/appointment/hooks";
import { useMyPets } from "../apis/pets/hooks";
import { useServices } from "../apis/services/hooks";
import { useInitiateEsewaPayment } from "../apis/payments/hooks";
import { useAuth } from "../context/AuthContext";

const fallbackServices = [
  {
    key: "vet",
    serviceName: "Vet Consultation",
    price: 1500,
    description: "Warm checkups, diagnostics, and gentle treatment planning.",
    durationMinutes: 45,
    icon: Stethoscope,
    badge: "Most booked",
  },
  {
    key: "grooming",
    serviceName: "Grooming Ritual",
    price: 1200,
    description: "Bathing, trimming, brush-out, and a soft paw care finish.",
    durationMinutes: 60,
    icon: Scissors,
    badge: "Glow-up favorite",
  },
  {
    key: "vaccination",
    serviceName: "Vaccination Visit",
    price: 900,
    description: "Core boosters and follow-up reminders tied to your records.",
    durationMinutes: 30,
    icon: Syringe,
    badge: "Preventive care",
  },
  {
    key: "dental",
    serviceName: "Dental Refresh",
    price: 1800,
    description: "Dental cleaning support and gum-health monitoring.",
    durationMinutes: 40,
    icon: Sparkles,
    badge: "Fresh breath",
  },
];

const slotOptions = ["09:00", "11:30", "14:00", "16:30"];
const petTypeOptions = ["Dog", "Cat", "Bird", "Exotic", "Other"];

const toLocalDate = (dateString) => new Date(`${dateString}T00:00:00`);

const getServicePresentation = (service, index) => {
  const label = service.serviceName.toLowerCase();
  const category = service.category?.toLowerCase() ?? "";

  if (label.includes("groom") || category === "grooming") {
    return {
      icon: Scissors,
      description: service.description || "Polished coat care with premium finishing touches.",
      badge: "Glow-up favorite",
    };
  }

  if (label.includes("vacc") || category === "vaccination") {
    return {
      icon: Syringe,
      description: service.description || "Protective boosters synced with your record timeline.",
      badge: "Preventive care",
    };
  }

  if (label.includes("dent") || category === "dental") {
    return {
      icon: Sparkles,
      description: service.description || "Comfort-first dental maintenance and follow-up reminders.",
      badge: "Fresh breath",
    };
  }

  if (label.includes("vet") || category === "vet") {
    return {
      icon: Stethoscope,
      description: service.description || "Consultations, diagnostics, and recovery guidance.",
      badge: "Most booked",
    };
  }

  return fallbackServices[index % fallbackServices.length];
};

const getCalendarDays = (selectedDate) => {
  const base = toLocalDate(selectedDate);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: 35 }, (_, index) => {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return new Date(year, month, dayNumber);
  });
};

const formatAppointmentMoment = (appointmentTime) =>
  new Date(appointmentTime).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatNpr = (amount) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const inferPetTypeFromSpecies = (species = "") => {
  const normalized = String(species).trim().toLowerCase();

  if (!normalized) {
    return "Dog";
  }

  if (normalized.includes("cat")) {
    return "Cat";
  }

  if (normalized.includes("bird")) {
    return "Bird";
  }

  if (normalized.includes("dog")) {
    return "Dog";
  }

  if (normalized.includes("rabbit") || normalized.includes("hamster") || normalized.includes("exotic")) {
    return "Exotic";
  }

  return "Other";
};

const bookingStatusTone = {
  pending: "bg-[#FFF0D6] text-[#8B6428]",
  confirmed: "bg-[#EAF7ED] text-[#3A7D45]",
  completed: "bg-[#EEF4FF] text-[#4669B0]",
  cancelled: "bg-[#FFF1EE] text-[#C45F3E]",
};

export const ServiceBookingPage = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { userProfile } = useAuth();
  const { data: petsResponse } = useMyPets();
  const { data: servicesResponse } = useServices();
  const { data: appointmentsResponse, isLoading: isAppointmentsLoading } = useAppointment();
  const { mutateAsync: createAppointment, isPending } = useCreateAppointment();
  const { mutateAsync: initiateEsewaPayment, isPending: isEsewaPending } = useInitiateEsewaPayment();
  const handledPaymentStatusRef = useRef("");

  const [selectedDate, setSelectedDate] = useState(() => {
    const initial = new Date();
    initial.setDate(initial.getDate() + 1);
    return initial.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(slotOptions[0]);
  const [selectedServiceKey, setSelectedServiceKey] = useState("");
  const [latestBookingId, setLatestBookingId] = useState("");
  const [latestAppointmentId, setLatestAppointmentId] = useState("");
  const [bookingForm, setBookingForm] = useState({
    ownerName: "",
    contactNumber: "",
    petName: "",
    petType: petTypeOptions[0],
    note: "",
  });

  const liveServices = servicesResponse?.data ?? [];
  const serviceCards = useMemo(() => {
    if (!liveServices.length) {
      return fallbackServices.map((service) => ({ ...service, _id: null }));
    }

    return liveServices.map((service, index) => {
      const presentation = getServicePresentation(service, index);
      return {
        ...service,
        ...presentation,
        key: service._id,
      };
    });
  }, [liveServices]);

  const appointments = appointmentsResponse?.data ?? [];
  const primaryPet = petsResponse?.data?.primaryPet ?? petsResponse?.data?.pets?.[0] ?? null;
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => new Date(appointment.appointmentTime) >= new Date())
        .slice(0, 4),
    [appointments]
  );
  useEffect(() => {
    if (!selectedServiceKey && serviceCards[0]) {
      setSelectedServiceKey(serviceCards[0]._id ?? serviceCards[0].key);
    }
  }, [selectedServiceKey, serviceCards]);

  useEffect(() => {
    setBookingForm((current) => ({
      ...current,
      ownerName: current.ownerName || userProfile?.fullName || userProfile?.displayName || "",
      contactNumber:
        current.contactNumber || userProfile?.contactNumber || userProfile?.phoneNumber || "",
      petName: current.petName || primaryPet?.name || "",
      petType: current.petName ? current.petType : inferPetTypeFromSpecies(primaryPet?.species),
    }));
  }, [primaryPet?.name, primaryPet?.species, userProfile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");

    if (!paymentStatus || handledPaymentStatusRef.current === paymentStatus + location.search) {
      return;
    }

    handledPaymentStatusRef.current = paymentStatus + location.search;

    if (paymentStatus === "success") {
      toast.success("eSewa sandbox payment completed successfully.");
      void queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setLatestBookingId(params.get("bookingId") ?? "");
      setLatestAppointmentId(params.get("appointmentId") ?? "");
      return;
    }

    if (paymentStatus === "cancelled") {
      toast.info("eSewa payment was cancelled. You can try again from your booking card.");
      return;
    }

    if (paymentStatus === "invalid-signature") {
      toast.error("Payment verification failed. Please try the sandbox payment again.");
      return;
    }

    if (paymentStatus === "failed") {
      toast.error("eSewa payment failed. Please try again.");
    }
  }, [location.search, queryClient]);

  const selectedService = serviceCards.find(
    (service) => (service._id ?? service.key) === selectedServiceKey
  );
  const calendarDays = getCalendarDays(selectedDate);
  const monthTitle = toLocalDate(selectedDate).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const handleFieldChange = (field) => (event) => {
    setBookingForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleConfirmBooking = async () => {
    if (!selectedService?._id) {
      toast.error("The backend service catalog is still loading. Restart the backend if needed.");
      return;
    }

    if (
      !bookingForm.ownerName.trim() ||
      !bookingForm.contactNumber.trim() ||
      !bookingForm.petName.trim() ||
      !bookingForm.petType.trim()
    ) {
      toast.error("Owner name, contact number, pet name, and pet type are all required.");
      return;
    }

    try {
      const response = await createAppointment({
        appointmentTime: new Date(`${selectedDate}T${selectedSlot}:00`).toISOString(),
        serviceId: selectedService._id,
        ownerName: bookingForm.ownerName,
        contactNumber: bookingForm.contactNumber,
        petName: bookingForm.petName,
        petType: bookingForm.petType,
        note: bookingForm.note,
      });

      await queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      setLatestBookingId(response.data?.appointment?.bookingId ?? "");
      setLatestAppointmentId(response.data?.appointment?._id ?? "");
      setBookingForm((current) => ({
        ...current,
        petName: "",
        petType: petTypeOptions[0],
        note: "",
      }));
      toast.success(
        response.data?.appointment?.bookingId
          ? `Appointment reserved. Booking ID ${response.data.appointment.bookingId}`
          : "Appointment reserved. Continue to sandbox payment."
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  const submitEsewaForm = (action, fields) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleEsewaPayment = async (appointmentId) => {
    try {
      const response = await initiateEsewaPayment({ appointmentId });
      const { formAction, formData, appointment } = response.data;
      setLatestAppointmentId(appointment?._id ?? appointmentId);
      setLatestBookingId(appointment?.bookingId ?? latestBookingId);
      submitEsewaForm(formAction, formData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    }
  };

  return (
    <div className="pet-page">
      <section className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
        <div className="pet-card overflow-hidden p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="pet-chip">Service Booking</span>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight">
                Book live appointments with the details your clinic actually needs.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B6B6B]">
                Services now come from the backend, each appointment gets a booking ID, and owner,
                pet, and contact details are saved for real follow-up.
              </p>
            </div>
            <div className="rounded-[24px] bg-[linear-gradient(135deg,#FFF4E2,#FFFFFF)] p-4 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B78331]">
                Promo
              </p>
              <p className="mt-2 text-lg font-bold">Kukur Tihar Care Week</p>
              <p className="mt-1 text-sm text-[#6B6B6B]">Enjoy 20% off grooming and dental bundles.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {serviceCards.map((service) => {
              const isSelected = (service._id ?? service.key) === selectedServiceKey;

              return (
                <Button
                  key={service._id ?? service.key}
                  type="button"
                  onClick={() => setSelectedServiceKey(service._id ?? service.key)}
                  className={`text-left rounded-[28px] p-5 transition-all ${
                    isSelected
                      ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_24px_50px_rgba(245,166,35,0.22)]"
                      : "bg-[#FFF8EE] text-[#2D2D2D] shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${isSelected ? "bg-white/20" : "bg-white"}`}>
                      <service.icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-[#F5A623]"}`} />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSelected ? "bg-white/15 text-white" : "bg-[#FFE3B3] text-[#8B6428]"}`}>
                      {service.badge}
                    </span>
                  </div>
                  <p className="mt-5 text-xl font-semibold">{service.serviceName}</p>
                  <p className={`mt-3 text-sm leading-7 ${isSelected ? "text-white/82" : "text-[#6B6B6B]"}`}>
                    {service.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-lg font-bold">
                      {formatNpr(service.price)}
                      <span className={`ml-2 text-sm font-medium ${isSelected ? "text-white/82" : "text-[#8B7B66]"}`}>
                        base fee
                      </span>
                    </p>
                    <span className={`text-sm font-semibold ${isSelected ? "text-white/82" : "text-[#8B7B66]"}`}>
                      {service.durationMinutes ?? 45} min
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[30px] bg-[#FFF8EE] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="pet-chip">Calendar</span>
                  <h2 className="mt-4 text-2xl font-bold">{monthTitle}</h2>
                </div>
                <CalendarDays className="h-7 w-7 text-[#F5A623]" />
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#9C8A72]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} className="aspect-square rounded-[18px] bg-transparent" />;
                  }

                  const dayIso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                  const isSelected = dayIso === selectedDate;

                  return (
                    <Button
                      key={dayIso}
                      type="button"
                      onClick={() => setSelectedDate(dayIso)}
                      className={`aspect-square rounded-[18px] text-sm font-semibold transition-all ${
                        isSelected
                          ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_18px_35px_rgba(245,166,35,0.2)]"
                          : "bg-white text-[#6B6B6B] hover:bg-[#FFEED0]"
                      }`}
                    >
                      {day.getDate()}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {slotOptions.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition-all ${
                      selectedSlot === slot
                        ? "bg-[#2D2D2D] text-white"
                        : "bg-white text-[#6B6B6B]"
                    }`}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] bg-[#FFF8EE] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="pet-chip">Required Details</span>
                    <h2 className="mt-4 text-2xl font-bold">Owner and pet information</h2>
                  </div>
                  <ClipboardList className="h-7 w-7 text-[#F5A623]" />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
                      <UserRound className="h-4 w-4 text-[#F5A623]" />
                      Owner name
                    </span>
                    <input
                      type="text"
                      value={bookingForm.ownerName}
                      onChange={handleFieldChange("ownerName")}
                      placeholder="Full name"
                      className="w-full rounded-[22px] bg-white px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
                      <Phone className="h-4 w-4 text-[#F5A623]" />
                      Contact number
                    </span>
                    <input
                      type="tel"
                      value={bookingForm.contactNumber}
                      onChange={handleFieldChange("contactNumber")}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full rounded-[22px] bg-white px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
                      <PawPrint className="h-4 w-4 text-[#F5A623]" />
                      Pet name
                    </span>
                    <input
                      type="text"
                      value={bookingForm.petName}
                      onChange={handleFieldChange("petName")}
                      placeholder="Your pet's name"
                      className="w-full rounded-[22px] bg-white px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
                      <Hash className="h-4 w-4 text-[#F5A623]" />
                      Pet type
                    </span>
                    <select
                      value={bookingForm.petType}
                      onChange={handleFieldChange("petType")}
                      className="w-full rounded-[22px] bg-white px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                      required
                    >
                      {petTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
                    <NotebookPen className="h-4 w-4 text-[#F5A623]" />
                    Notes for the visit
                  </span>
                  <textarea
                    value={bookingForm.note}
                    onChange={handleFieldChange("note")}
                    placeholder="Allergies, behavior notes, symptoms, or anything helpful for the visit"
                    rows={4}
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  />
                </label>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-white px-4 py-3 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">
                      PetHub ID
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#2D2D2D]">
                      {userProfile?.petHubId ?? "Assigned after profile sync"}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-white px-4 py-3 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">
                      Account email
                    </p>
                    <p className="mt-2 truncate text-sm font-semibold text-[#2D2D2D]">
                      {userProfile?.email ?? "Signed-in account"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.04)]">
                <span className="pet-chip">Booking Summary</span>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-[22px] bg-white/80 px-4 py-3 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                    <span className="text-sm text-[#6B6B6B]">Selected service</span>
                    <span className="text-sm font-semibold">{selectedService?.serviceName ?? "Choose one"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] bg-white/80 px-4 py-3 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                    <span className="text-sm text-[#6B6B6B]">Date and time</span>
                    <span className="text-sm font-semibold">
                      {new Date(`${selectedDate}T00:00:00`).toLocaleDateString()} at {selectedSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] bg-white/80 px-4 py-3 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                    <span className="text-sm text-[#6B6B6B]">Estimated total</span>
                    <span className="text-sm font-semibold">
                      {selectedService ? formatNpr(selectedService.price) : "--"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] bg-white/80 px-4 py-3 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                    <span className="text-sm text-[#6B6B6B]">Booking ID</span>
                    <span className="text-sm font-semibold">{latestBookingId || "Generated on confirm"}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] bg-[#2D2D2D] p-5 text-white">
                  <div className="flex items-center gap-3">
                    <ShieldPlus className="h-5 w-5 text-[#FFB347]" />
                    <p className="text-sm font-semibold">NPR only with eSewa sandbox</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    PetHub reserves the booking in MongoDB, then you can pay in Nepali rupees through
                    the eSewa sandbox using EPAYTEST.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    After that, admin can confirm or complete the booking and the update will appear in
                    your bookings list and notifications.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isPending}
                  className="pet-button-primary mt-6 w-full gap-2"
                >
                  {isPending ? "Reserving appointment..." : "Reserve appointment"}
                  {isPending ? <Clock3 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </Button>

                {latestAppointmentId ? (
                  <div className="mt-4 rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <div className="flex items-center gap-3">
                      <WalletCards className="h-5 w-5 text-[#F5A623]" />
                      <p className="text-sm font-semibold">Complete sandbox payment with eSewa</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                      Test with eSewa ID 9806800001, password Nepal@123, MPIN 1122, and token
                      123456. Sandbox only and billed in NPR.
                    </p>
                    <Button
                      type="button"
                      onClick={() => handleEsewaPayment(latestAppointmentId)}
                      disabled={isEsewaPending}
                      className="pet-button-secondary mt-4 w-full gap-2"
                    >
                      <WalletCards className="h-4 w-4 text-[#F5A623]" />
                      {isEsewaPending ? "Opening eSewa sandbox..." : "Pay with eSewa sandbox"}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="pet-card p-6">
            <span className="pet-chip">How It Works</span>
            <div className="mt-6 space-y-4">
              {[
                "Choose a live service from the backend catalog.",
                "Fill in owner name, phone number, pet name, and pet type.",
                "Confirm the slot to generate a booking ID and send an email.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm font-medium text-[#5B544C] shadow-[0_14px_28px_rgba(45,45,45,0.04)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="pet-card overflow-hidden bg-[linear-gradient(140deg,#2D2D2D,#5A4632)] p-6 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              <Sparkles className="h-4 w-4" />
              Booking Notes
            </span>
            <h2 className="mt-4 text-3xl font-bold">Bring your booking ID when you arrive.</h2>
            <p className="mt-3 text-sm leading-7 text-white/75">
              The booking summary and confirmation email are now tied together, so clinic staff can
              find the appointment quickly using your saved owner and pet details.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="pet-card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="pet-chip">Live Bookings</span>
              <h2 className="mt-4 text-3xl font-bold">Your upcoming appointments</h2>
            </div>
            <ClipboardList className="h-7 w-7 text-[#F5A623]" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {isAppointmentsLoading ? (
              <div className="rounded-[26px] bg-[#FFF8EE] p-5 text-sm text-[#6B6B6B] shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                Loading your saved appointments...
              </div>
            ) : upcomingAppointments.length ? (
              upcomingAppointments.map((appointment) => (
                <article
                  key={appointment._id}
                  className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="pet-chip">{appointment.bookingId}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${bookingStatusTone[appointment.status] ?? "bg-white text-[#8B6428]"}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{appointment.petName}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                    {appointment.serviceId?.serviceName} for {appointment.petType}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-[#5B544C]">
                    <p><span className="font-semibold">When:</span> {formatAppointmentMoment(appointment.appointmentTime)}</p>
                    <p><span className="font-semibold">Owner:</span> {appointment.ownerName}</p>
                    <p><span className="font-semibold">Contact:</span> {appointment.contactNumber}</p>
                    <p><span className="font-semibold">Amount:</span> {formatNpr(appointment.payment?.amount)}</p>
                    <p><span className="font-semibold">Payment:</span> {appointment.payment?.status ?? "unpaid"}</p>
                    <p className="text-[#8B7B66]">
                      {appointment.status === "pending"
                        ? "Awaiting admin confirmation."
                        : appointment.status === "confirmed"
                          ? "Confirmed by the PetHub care team."
                          : appointment.status === "completed"
                            ? "Completed and recorded by the PetHub care team."
                            : "This booking was cancelled."}
                    </p>
                  </div>
                  {appointment.payment?.status !== "paid" ? (
                    <Button
                      type="button"
                      onClick={() => handleEsewaPayment(appointment._id)}
                      disabled={isEsewaPending}
                      className="pet-button-secondary mt-4 w-full gap-2"
                    >
                      <WalletCards className="h-4 w-4 text-[#F5A623]" />
                      {isEsewaPending ? "Opening eSewa sandbox..." : "Pay with eSewa sandbox"}
                    </Button>
                  ) : (
                    <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFF0D6] px-5 py-3 text-sm font-semibold text-[#8B6428]">
                      <Check className="h-4 w-4" />
                      Paid in NPR
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-[26px] bg-[#FFF8EE] p-6 text-sm leading-7 text-[#6B6B6B] shadow-[0_16px_35px_rgba(45,45,45,0.04)] lg:col-span-2">
                No live appointments yet. Confirm one above and it will appear here with its booking ID.
              </div>
            )}
          </div>
        </div>

        <div className="pet-card bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6">
          <span className="pet-chip">Saved Profile</span>
          <div className="mt-5 space-y-4">
            <div className="rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Member</p>
              <p className="mt-2 text-lg font-bold">{userProfile?.fullName || userProfile?.displayName || "Pet Parent"}</p>
              <p className="mt-1 text-sm text-[#6B6B6B]">{userProfile?.email ?? "Signed-in user"}</p>
            </div>
            <div className="rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Contact Number</p>
              <p className="mt-2 text-lg font-bold">{userProfile?.contactNumber ?? "Add it in signup or booking"}</p>
            </div>
            <div className="rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Primary Pet</p>
              <p className="mt-2 text-lg font-bold">{primaryPet?.name ?? "Add a pet in onboarding/profile"}</p>
              <p className="mt-1 text-sm text-[#6B6B6B]">{primaryPet?.species ?? "Pet profile not connected yet"}</p>
            </div>
            <div className="rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Current Slot</p>
              <p className="mt-2 text-lg font-bold">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString()} at {selectedSlot}
              </p>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                {selectedService?.serviceName ?? "Select a service"} for {bookingForm.petName || "your pet"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
