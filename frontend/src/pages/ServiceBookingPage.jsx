import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import {
  CalendarDays, Check, ClipboardList, Clock3, Hash,
  NotebookPen, PawPrint, Phone, Scissors, ShieldPlus,
  Sparkles, Stethoscope, Syringe, WalletCards, UserRound,
  ArrowRight, CheckCircle2, Tag,
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
  { key: "vet",        serviceName: "Vet Consultation", price: 1500, description: "Warm checkups, diagnostics, and gentle treatment planning.", durationMinutes: 45, icon: Stethoscope, badge: "Most booked" },
  { key: "grooming",   serviceName: "Grooming Ritual",  price: 1200, description: "Bathing, trimming, brush-out, and a soft paw care finish.",  durationMinutes: 60, icon: Scissors,   badge: "Glow-up favorite" },
  { key: "vaccination",serviceName: "Vaccination Visit",price: 900,  description: "Core boosters and follow-up reminders tied to your records.", durationMinutes: 30, icon: Syringe,    badge: "Preventive care" },
  { key: "dental",     serviceName: "Dental Refresh",   price: 1800, description: "Dental cleaning support and gum-health monitoring.",           durationMinutes: 40, icon: Sparkles,   badge: "Fresh breath" },
];

const slotOptions = ["09:00", "11:30", "14:00", "16:30"];
const petTypeOptions = ["Dog", "Cat", "Bird", "Exotic", "Other"];

const toLocalDate = (dateString) => new Date(`${dateString}T00:00:00`);

const getServicePresentation = (service, index) => {
  const label    = service.serviceName.toLowerCase();
  const category = service.category?.toLowerCase() ?? "";
  if (label.includes("groom") || category === "grooming")    return { icon: Scissors,   description: service.description || "Polished coat care with premium finishing touches.", badge: "Glow-up favorite" };
  if (label.includes("vacc")  || category === "vaccination") return { icon: Syringe,    description: service.description || "Protective boosters synced with your record timeline.", badge: "Preventive care" };
  if (label.includes("dent")  || category === "dental")      return { icon: Sparkles,   description: service.description || "Comfort-first dental maintenance and follow-up reminders.", badge: "Fresh breath" };
  if (label.includes("vet")   || category === "vet")         return { icon: Stethoscope,description: service.description || "Consultations, diagnostics, and recovery guidance.", badge: "Most booked" };
  return fallbackServices[index % fallbackServices.length];
};

const getCalendarDays = (selectedDate) => {
  const base = toLocalDate(selectedDate);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: 35 }, (_, i) => {
    const d = i - startOffset + 1;
    return (d < 1 || d > daysInMonth) ? null : new Date(year, month, d);
  });
};

const formatAppointmentMoment = (t) =>
  new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const formatNpr = (amount) =>
  new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(Number(amount || 0));

const inferPetTypeFromSpecies = (species = "") => {
  const n = String(species).trim().toLowerCase();
  if (!n) return "Dog";
  if (n.includes("cat")) return "Cat";
  if (n.includes("bird")) return "Bird";
  if (n.includes("dog")) return "Dog";
  if (n.includes("rabbit") || n.includes("hamster") || n.includes("exotic")) return "Exotic";
  return "Other";
};

const bookingStatusConfig = {
  pending:   { bg: "#FFF8E1", text: "#E65100", dot: "#F5A623" },
  confirmed: { bg: "#E3F2FD", text: "#1565C0", dot: "#42A5F5" },
  completed: { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" },
  cancelled: { bg: "#FFEBEE", text: "#C62828", dot: "#EF5350" },
};

export const ServiceBookingPage = () => {
  const queryClient    = useQueryClient();
  const location       = useLocation();
  const { userProfile }= useAuth();
  const { data: petsResponse }         = useMyPets();
  const { data: servicesResponse }     = useServices();
  const { data: appointmentsResponse, isLoading: isAppointmentsLoading } = useAppointment();
  const { mutateAsync: createAppointment,    isPending }        = useCreateAppointment();
  const { mutateAsync: initiateEsewaPayment, isPending: isEsewaPending } = useInitiateEsewaPayment();
  const handledPaymentStatusRef = useRef("");

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedSlot,       setSelectedSlot]       = useState(slotOptions[0]);
  const [selectedServiceKey, setSelectedServiceKey] = useState("");
  const [latestBookingId,    setLatestBookingId]    = useState("");
  const [latestAppointmentId,setLatestAppointmentId]= useState("");
  const [bookingForm, setBookingForm] = useState({
    ownerName: "", contactNumber: "", petName: "", petType: petTypeOptions[0], note: "",
  });

  const liveServices = servicesResponse?.data ?? [];
  const serviceCards = useMemo(() => {
    if (!liveServices.length) return fallbackServices.map((s) => ({ ...s, _id: null }));
    return liveServices.map((s, i) => ({ ...s, ...getServicePresentation(s, i), key: s._id }));
  }, [liveServices]);

  const appointments        = appointmentsResponse?.data ?? [];
  const primaryPet          = petsResponse?.data?.primaryPet ?? petsResponse?.data?.pets?.[0] ?? null;
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => new Date(a.appointmentTime) >= new Date()).slice(0, 4),
    [appointments]
  );

  useEffect(() => {
    if (!selectedServiceKey && serviceCards[0]) setSelectedServiceKey(serviceCards[0]._id ?? serviceCards[0].key);
  }, [selectedServiceKey, serviceCards]);

  useEffect(() => {
    setBookingForm((c) => ({
      ...c,
      ownerName:     c.ownerName     || userProfile?.fullName || userProfile?.displayName || "",
      contactNumber: c.contactNumber || userProfile?.contactNumber || userProfile?.phoneNumber || "",
      petName:       c.petName       || primaryPet?.name || "",
      petType:       c.petName       ? c.petType : inferPetTypeFromSpecies(primaryPet?.species),
    }));
  }, [primaryPet?.name, primaryPet?.species, userProfile]);

  useEffect(() => {
    const params        = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");
    if (!paymentStatus || handledPaymentStatusRef.current === paymentStatus + location.search) return;
    handledPaymentStatusRef.current = paymentStatus + location.search;
    if (paymentStatus === "success") {
      toast.success("eSewa sandbox payment completed successfully.");
      void queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setLatestBookingId(params.get("bookingId") ?? "");
      setLatestAppointmentId(params.get("appointmentId") ?? "");
    } else if (paymentStatus === "cancelled")        toast.info("eSewa payment was cancelled. You can try again from your booking card.");
    else if (paymentStatus === "invalid-signature")  toast.error("Payment verification failed. Please try the sandbox payment again.");
    else if (paymentStatus === "failed")             toast.error("eSewa payment failed. Please try again.");
  }, [location.search, queryClient]);

  const selectedService = serviceCards.find((s) => (s._id ?? s.key) === selectedServiceKey);
  const calendarDays    = getCalendarDays(selectedDate);
  const monthTitle      = toLocalDate(selectedDate).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const handleFieldChange = (field) => (e) =>
    setBookingForm((c) => ({ ...c, [field]: e.target.value }));

  const handleConfirmBooking = async () => {
    if (!selectedService?._id) { toast.error("The backend service catalog is still loading."); return; }
    if (!bookingForm.ownerName.trim() || !bookingForm.contactNumber.trim() || !bookingForm.petName.trim() || !bookingForm.petType.trim()) {
      toast.error("Owner name, contact number, pet name, and pet type are all required."); return;
    }
    try {
      const response = await createAppointment({
        appointmentTime: new Date(`${selectedDate}T${selectedSlot}:00`).toISOString(),
        serviceId: selectedService._id,
        ownerName: bookingForm.ownerName, contactNumber: bookingForm.contactNumber,
        petName: bookingForm.petName, petType: bookingForm.petType, note: bookingForm.note,
      });
      await queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      setLatestBookingId(response.data?.appointment?.bookingId ?? "");
      setLatestAppointmentId(response.data?.appointment?._id ?? "");
      setBookingForm((c) => ({ ...c, petName: "", petType: petTypeOptions[0], note: "" }));
      toast.success(response.data?.appointment?.bookingId
        ? `Appointment reserved. Booking ID ${response.data.appointment.bookingId}`
        : "Appointment reserved. Continue to sandbox payment.");
    } catch (error) { toast.error(error.response?.data?.message || error.message); }
  };

  const submitEsewaForm = (action, fields) => {
    const form = document.createElement("form");
    form.method = "POST"; form.action = action;
    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden"; input.name = k; input.value = String(v ?? "");
      form.appendChild(input);
    });
    document.body.appendChild(form); form.submit(); document.body.removeChild(form);
  };

  const handleEsewaPayment = async (appointmentId) => {
    try {
      const response = await initiateEsewaPayment({ appointmentId });
      const { formAction, formData, appointment } = response.data;
      setLatestAppointmentId(appointment?._id ?? appointmentId);
      setLatestBookingId(appointment?.bookingId ?? latestBookingId);
      submitEsewaForm(formAction, formData);
    } catch (error) { toast.error(error.response?.data?.message || error.message); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6 sm:px-6 lg:px-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .sb-root  { font-family: 'DM Sans', sans-serif; color: #1A1A1A; }
        .sb-serif { font-family: 'Fraunces', Georgia, serif; }

        .sb-card {
          background: #fff;
          border-radius: 22px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        }

        .sb-chip {
          display: inline-flex; align-items: center;
          background: #F5F0E8; color: #8B6F47;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px;
        }

        .sb-input {
          width: 100%; background: #F7F3ED;
          border: 1.5px solid transparent; border-radius: 14px;
          padding: 12px 16px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; color: #1A1A1A;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sb-input:focus { border-color: #F5A623; box-shadow: 0 0 0 3px rgba(245,166,35,0.12); }
        .sb-input::placeholder { color: #B0A898; }
        select.sb-input { appearance: none; cursor: pointer; }

        .sb-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9B8C7A; margin-bottom: 7px;
        }

        .sb-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #1A1A1A; color: #fff;
          font-size: 13px; font-weight: 600;
          padding: 12px 20px; border-radius: 13px;
          border: none; cursor: pointer; transition: background 0.2s, transform 0.15s;
        }
        .sb-btn-primary:hover    { background: #333; transform: translateY(-1px); }
        .sb-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .sb-btn-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #FFF5E4; color: #8B6F47;
          font-size: 13px; font-weight: 600;
          padding: 12px 20px; border-radius: 13px;
          border: 1.5px solid #F0DFC0; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .sb-btn-secondary:hover    { background: #FDECC8; transform: translateY(-1px); }
        .sb-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .service-card {
          border-radius: 18px; padding: 18px;
          border: 2px solid transparent; cursor: pointer;
          transition: all 0.2s ease; text-align: left; width: 100%;
        }
        .service-card-idle     { background: #F7F3ED; border-color: transparent; }
        .service-card-idle:hover { border-color: #F5A623; background: #FFF8EE; }
        .service-card-selected { background: linear-gradient(135deg,#F5A623,#F09415); border-color: transparent; box-shadow: 0 12px 32px rgba(245,166,35,0.28); }

        .cal-day {
          aspect-ratio: 1; min-height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s;
        }
        .cal-day-idle     { background: #F7F3ED; color: #5B4A36; }
        .cal-day-idle:hover { background: #FDECC8; }
        .cal-day-selected { background: #1A1A1A; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        .slot-btn {
          padding: 10px 14px; border-radius: 12px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 2px solid transparent;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .slot-idle     { background: #F7F3ED; color: #5B4A36; }
        .slot-idle:hover { border-color: #F5A623; }
        .slot-selected { background: #F5A623; color: #fff; box-shadow: 0 4px 12px rgba(245,166,35,0.3); }

        .summary-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 12px;
          background: #F7F3ED; gap: 12px;
        }

        .apt-booking-card {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          overflow: hidden;
        }
      `}</style>

      <div className="sb-root mx-auto max-w-7xl space-y-5">

        {/* ── HEADER ── */}
        <div className="sb-card p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0D6]">
                <CalendarDays className="h-7 w-7 text-[#F5A623]" />
              </div>
              <div>
                <span className="sb-chip">Service Booking</span>
                <h1 className="sb-serif mt-1.5 text-2xl font-700 leading-tight sm:text-3xl">
                  Book a care appointment
                </h1>
              </div>
            </div>
            {/* Promo badge */}
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#FFF4E2] to-[#FFF9F0] px-5 py-3 border border-[#F0DFC0]">
              <Tag className="h-4 w-4 text-[#F5A623]" />
              <div>
                <p className="text-[10px] font-700 uppercase tracking-widest text-[#B78331]">Promo</p>
                <p className="text-sm font-700 text-[#1A1A1A]">Kukur Tihar Care Week</p>
                <p className="text-xs text-[#8B6F47]">20% off grooming &amp; dental bundles</p>
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6B6B6B]">
            Services come from the backend catalog. Each appointment gets a booking ID, and owner, pet, and contact details are saved for real follow-up.
          </p>
        </div>

        {/* ── MAIN BOOKING GRID ── */}
        <div className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT — Service picker + Calendar + Form */}
          <div className="space-y-5">

            {/* Service cards */}
            <div className="sb-card p-5 sm:p-6">
              <span className="sb-chip">Choose a service</span>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {serviceCards.map((service) => {
                  const isSelected = (service._id ?? service.key) === selectedServiceKey;
                  return (
                    <button
                      key={service._id ?? service.key}
                      type="button"
                      onClick={() => setSelectedServiceKey(service._id ?? service.key)}
                      className={`service-card ${isSelected ? "service-card-selected" : "service-card-idle"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? "bg-white/20" : "bg-white shadow-sm"}`}>
                          <service.icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-[#F5A623]"}`} />
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-700 uppercase tracking-wider ${isSelected ? "bg-white/20 text-white" : "bg-[#FFE8B8] text-[#8B6428]"}`}>
                          {service.badge}
                        </span>
                      </div>
                      <p className={`mt-4 text-base font-700 ${isSelected ? "text-white" : "text-[#1A1A1A]"}`}>{service.serviceName}</p>
                      <p className={`mt-1.5 text-xs leading-relaxed ${isSelected ? "text-white/80" : "text-[#6B6B6B]"}`}>{service.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className={`sb-serif text-xl font-700 ${isSelected ? "text-white" : "text-[#1A1A1A]"}`}>
                          {formatNpr(service.price)}
                        </p>
                        <span className={`text-xs font-600 ${isSelected ? "text-white/75" : "text-[#9B9B9B]"}`}>
                          {service.durationMinutes ?? 45} min
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar + Slots */}
            <div className="sb-card p-5 sm:p-6">
              <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="sb-chip">Pick a date</span>
                      <h2 className="sb-serif mt-2 text-xl font-700">{monthTitle}</h2>
                    </div>
                    <CalendarDays className="h-6 w-6 text-[#F5A623]" />
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-700 uppercase tracking-wider text-[#9B8C7A]">
                    {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => <span key={d}>{d}</span>)}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                      if (!day) return <span key={`e-${i}`} />;
                      const iso = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`;
                      const isSel = iso === selectedDate;
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => setSelectedDate(iso)}
                          className={`cal-day ${isSel ? "cal-day-selected" : "cal-day-idle"}`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Slots */}
                <div className="min-w-[140px]">
                  <span className="sb-chip">Time slot</span>
                  <div className="mt-4 grid gap-2">
                    {slotOptions.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`slot-btn ${selectedSlot === slot ? "slot-selected" : "slot-idle"}`}
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking form */}
            <div className="sb-card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="sb-chip">Your details</span>
                  <h2 className="sb-serif mt-2 text-xl font-700">Owner &amp; pet information</h2>
                </div>
                <ClipboardList className="h-6 w-6 text-[#F5A623]" />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* Owner name */}
                <div>
                  <label className="sb-label"><UserRound className="h-3.5 w-3.5 text-[#F5A623]" />Owner name</label>
                  <input type="text" value={bookingForm.ownerName} onChange={handleFieldChange("ownerName")} placeholder="Full name" className="sb-input" required />
                </div>
                {/* Contact */}
                <div>
                  <label className="sb-label"><Phone className="h-3.5 w-3.5 text-[#F5A623]" />Contact number</label>
                  <input type="tel" value={bookingForm.contactNumber} onChange={handleFieldChange("contactNumber")} placeholder="+977 98XXXXXXXX" className="sb-input" required />
                </div>
                {/* Pet name */}
                <div>
                  <label className="sb-label"><PawPrint className="h-3.5 w-3.5 text-[#F5A623]" />Pet name</label>
                  <input type="text" value={bookingForm.petName} onChange={handleFieldChange("petName")} placeholder="Your pet's name" className="sb-input" required />
                </div>
                {/* Pet type */}
                <div>
                  <label className="sb-label"><Hash className="h-3.5 w-3.5 text-[#F5A623]" />Pet type</label>
                  <select value={bookingForm.petType} onChange={handleFieldChange("petType")} className="sb-input" required>
                    {petTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Notes — full width */}
                <div className="sm:col-span-2">
                  <label className="sb-label"><NotebookPen className="h-3.5 w-3.5 text-[#F5A623]" />Notes for the visit</label>
                  <textarea value={bookingForm.note} onChange={handleFieldChange("note")} placeholder="Allergies, behaviour notes, symptoms, or anything helpful for the visit" rows={3} className="sb-input resize-none" />
                </div>
              </div>

              {/* Account meta */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#F7F3ED] px-4 py-3">
                  <p className="text-[10px] font-700 uppercase tracking-widest text-[#9B8C7A]">PetHub ID</p>
                  <p className="mt-1 text-sm font-600 text-[#1A1A1A]">{userProfile?.petHubId ?? "Assigned after profile sync"}</p>
                </div>
                <div className="rounded-xl bg-[#F7F3ED] px-4 py-3">
                  <p className="text-[10px] font-700 uppercase tracking-widest text-[#9B8C7A]">Account email</p>
                  <p className="mt-1 truncate text-sm font-600 text-[#1A1A1A]">{userProfile?.email ?? "Signed-in account"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Summary + Confirm + Side info */}
          <div className="space-y-5">

            {/* Booking summary */}
            <div className="sb-card p-5 sm:p-6">
              <span className="sb-chip">Booking summary</span>
              <div className="mt-5 space-y-2.5">
                {[
                  { label: "Service",        value: selectedService?.serviceName ?? "Choose one" },
                  { label: "Date",           value: toLocalDate(selectedDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) },
                  { label: "Time",           value: selectedSlot },
                  { label: "Estimated total",value: selectedService ? formatNpr(selectedService.price) : "--" },
                  { label: "Booking ID",     value: latestBookingId || "Generated on confirm" },
                ].map(({ label, value }) => (
                  <div key={label} className="summary-row">
                    <span className="text-sm text-[#6B6B6B]">{label}</span>
                    <span className="text-sm font-700 text-[#1A1A1A] text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* eSewa info */}
              <div className="mt-5 rounded-2xl bg-[#1A1A2E] p-4 text-white">
                <div className="flex items-center gap-2.5">
                  <ShieldPlus className="h-5 w-5 text-[#FFB347] shrink-0" />
                  <p className="text-sm font-600">NPR only · eSewa sandbox</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/70">
                  PetHub reserves the booking in MongoDB, then you can pay in Nepali rupees through the eSewa sandbox using EPAYTEST. Admin can confirm or complete the booking and the update will appear in your bookings list.
                </p>
              </div>

              {/* Confirm button */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isPending}
                className="sb-btn-primary mt-5 w-full justify-center"
              >
                {isPending ? "Reserving…" : "Reserve appointment"}
                {isPending ? <Clock3 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </button>

              {/* eSewa payment card (shows after booking) */}
              {latestAppointmentId && (
                <div className="mt-4 rounded-2xl border border-[#F0DFC0] bg-[#FFF8EE] p-4">
                  <div className="flex items-center gap-2.5">
                    <WalletCards className="h-5 w-5 text-[#F5A623]" />
                    <p className="text-sm font-700">Pay with eSewa sandbox</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#6B6B6B]">
                    Test with eSewa ID <strong>9806800001</strong>, password <strong>Nepal@123</strong>, MPIN <strong>1122</strong>, token <strong>123456</strong>. Sandbox only, billed in NPR.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleEsewaPayment(latestAppointmentId)}
                    disabled={isEsewaPending}
                    className="sb-btn-secondary mt-4 w-full justify-center"
                  >
                    <WalletCards className="h-4 w-4" />
                    {isEsewaPending ? "Opening eSewa…" : "Pay with eSewa sandbox"}
                  </button>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="sb-card p-5 sm:p-6">
              <span className="sb-chip">How it works</span>
              <div className="mt-5 space-y-3">
                {[
                  "Choose a live service from the backend catalog.",
                  "Fill in owner name, phone number, pet name, and pet type.",
                  "Confirm the slot to generate a booking ID and send an email.",
                ].map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-[11px] font-700 text-white">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-[#6B6B6B]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved profile */}
            <div className="sb-card p-5 sm:p-6">
              <span className="sb-chip">Saved profile</span>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Member",       value: userProfile?.fullName || userProfile?.displayName || "Pet Parent", sub: userProfile?.email ?? "Signed-in user" },
                  { label: "Contact",      value: userProfile?.contactNumber ?? "Not saved", sub: null },
                  { label: "Primary pet",  value: primaryPet?.name ?? "Add in onboarding", sub: primaryPet?.species ?? null },
                  { label: "Current slot", value: `${toLocalDate(selectedDate).toLocaleDateString()} at ${selectedSlot}`, sub: `${selectedService?.serviceName ?? "No service"} for ${bookingForm.petName || "your pet"}` },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="rounded-xl bg-[#F7F3ED] px-4 py-3">
                    <p className="text-[10px] font-700 uppercase tracking-widest text-[#9B8C7A]">{label}</p>
                    <p className="mt-1 text-sm font-700 text-[#1A1A1A]">{value}</p>
                    {sub && <p className="mt-0.5 text-xs text-[#9B9B9B]">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Bring your booking ID card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1A1A2E] to-[#2D2320] p-5 text-white border border-white/5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-700 uppercase tracking-widest text-white/70">
                <Sparkles className="h-3 w-3" /> Booking note
              </span>
              <h2 className="sb-serif mt-3 text-xl font-700">Bring your booking ID when you arrive.</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/65">
                The booking summary and confirmation email are tied together, so clinic staff can find your appointment quickly using your saved owner and pet details.
              </p>
            </div>
          </div>
        </div>

        {/* ── UPCOMING APPOINTMENTS ── */}
        <div className="sb-card p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="sb-chip">Live bookings</span>
              <h2 className="sb-serif mt-2 text-2xl font-700">Your upcoming appointments</h2>
            </div>
            <ClipboardList className="h-6 w-6 text-[#F5A623]" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isAppointmentsLoading ? (
              <div className="col-span-full rounded-2xl bg-[#F7F3ED] p-5 text-sm text-[#9B9B9B]">
                Loading appointments…
              </div>
            ) : upcomingAppointments.length ? (
              upcomingAppointments.map((apt) => {
                const s = bookingStatusConfig[apt.status] ?? { bg: "#F5F5F5", text: "#555", dot: "#999" };
                return (
                  <article key={apt._id} className="apt-booking-card">
                    <div className="h-1 w-full" style={{ background: s.dot }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="sb-chip">{apt.bookingId}</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-wider" style={{ background: s.bg, color: s.text }}>{apt.status}</span>
                      </div>
                      <h3 className="sb-serif mt-3 text-lg font-700">{apt.petName}</h3>
                      <p className="mt-1 text-xs text-[#6B6B6B]">{apt.serviceId?.serviceName} · {apt.petType}</p>
                      <div className="mt-3 space-y-1 text-xs text-[#6B6B6B]">
                        <p><span className="font-600 text-[#1A1A1A]">When</span> · {formatAppointmentMoment(apt.appointmentTime)}</p>
                        <p><span className="font-600 text-[#1A1A1A]">Owner</span> · {apt.ownerName}</p>
                        <p><span className="font-600 text-[#1A1A1A]">Amount</span> · {formatNpr(apt.payment?.amount)}</p>
                        <p>
                          <span className="font-600 text-[#1A1A1A]">Payment</span> ·{" "}
                          <span className={apt.payment?.status === "paid" ? "text-[#2E7D32]" : "text-[#E65100]"}>
                            {apt.payment?.status ?? "unpaid"}
                          </span>
                        </p>
                      </div>
                      <p className="mt-2 text-[11px] italic text-[#9B9B9B]">
                        {apt.status === "pending"   ? "Awaiting admin confirmation." :
                         apt.status === "confirmed" ? "Confirmed by the PetHub care team." :
                         apt.status === "completed" ? "Completed and recorded." :
                                                      "This booking was cancelled."}
                      </p>
                      <div className="mt-4">
                        {apt.payment?.status !== "paid" ? (
                          <button type="button" onClick={() => handleEsewaPayment(apt._id)} disabled={isEsewaPending} className="sb-btn-secondary w-full justify-center text-xs py-2.5">
                            <WalletCards className="h-3.5 w-3.5" />
                            {isEsewaPending ? "Opening…" : "Pay with eSewa"}
                          </button>
                        ) : (
                          <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8F5E9] py-2.5 text-xs font-700 text-[#2E7D32]">
                            <CheckCircle2 className="h-4 w-4" /> Paid in NPR
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full rounded-2xl bg-[#F7F3ED] p-6 text-center text-sm text-[#9B9B9B]">
                No live appointments yet. Confirm one above and it will appear here with its booking ID.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
