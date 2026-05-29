import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays, Check, CheckCircle2, ClipboardList, Clock3, Hash,
  NotebookPen, PawPrint, Phone, Scissors, ShieldPlus,
  Sparkles, Stethoscope, Syringe, WalletCards, UserRound,
  XCircle, X, ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useCreateAppointment } from "../apis/appointment/hooks";
import { useMyPets } from "../apis/pets/hooks";
import { useServices } from "../apis/services/hooks";
import { useMyRecords } from "../apis/records/hooks";
import { useInitiateKhaltiPayment, useVerifyKhaltiPayment } from "../apis/payments/hooks";
import { useAuth } from "../context/AuthContext";

/* ── Payment result modal ── */
function PaymentResultModal({ result, onClose }) {
  if (!result) return null;
  const isSuccess = result.status === "success";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl p-6 text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${isSuccess ? "bg-emerald-50" : "bg-red-50"}`}>
          {isSuccess
            ? <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            : <XCircle className="h-8 w-8 text-red-400" />}
        </div>
        <h2 className={`mt-4 text-xl font-bold ${isSuccess ? "text-emerald-700" : "text-red-600"}`}>
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </h2>
        {isSuccess ? (
          <div className="mt-4 space-y-2 text-left">
            {result.transactionCode && (
              <div className="flex items-center justify-between rounded-xl bg-[#FFF8EE] px-4 py-2.5">
                <span className="text-xs font-semibold text-[#9A8A6A]">Transaction ID</span>
                <span className="text-xs font-bold text-[#2D2D2D]">{result.transactionCode}</span>
              </div>
            )}
            {result.bookingId && (
              <div className="flex items-center justify-between rounded-xl bg-[#FFF8EE] px-4 py-2.5">
                <span className="text-xs font-semibold text-[#9A8A6A]">Booking ID</span>
                <span className="text-xs font-bold text-[#2D2D2D]">{result.bookingId}</span>
              </div>
            )}
            {result.amount && (
              <div className="flex items-center justify-between rounded-xl bg-[#FFF8EE] px-4 py-2.5">
                <span className="text-xs font-semibold text-[#9A8A6A]">Amount Paid</span>
                <span className="text-xs font-bold text-emerald-600">NPR {result.amount}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">
            {result.message || "Your payment could not be processed. Please try again."}
          </p>
        )}
        <button
          onClick={onClose}
          className={`mt-6 w-full rounded-full py-3 text-sm font-semibold text-white transition-all ${
            isSuccess
              ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:opacity-90"
              : "bg-gray-700 hover:bg-gray-800"
          }`}
        >
          {isSuccess ? "Continue" : "Close"}
        </button>
      </div>
    </div>
  );
}

const fallbackServices = [
  { key: "vet",        serviceName: "Vet Consultation", price: 1500, description: "Warm checkups, diagnostics, and gentle treatment planning.", durationMinutes: 45, icon: Stethoscope, badge: "Most booked" },
  { key: "grooming",   serviceName: "Grooming Ritual",  price: 1200, description: "Bathing, trimming, brush-out, and a soft paw care finish.",  durationMinutes: 60, icon: Scissors,   badge: "Glow-up favorite" },
  { key: "vaccination",serviceName: "Vaccination Visit",price: 900,  description: "Core boosters and follow-up reminders tied to your records.", durationMinutes: 30, icon: Syringe,    badge: "Preventive care" },
  { key: "dental",     serviceName: "Dental Refresh",   price: 1800, description: "Dental cleaning support and gum-health monitoring.",           durationMinutes: 40, icon: Sparkles,   badge: "Fresh breath" },
];

const slotOptions = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const petTypeOptions = ["Dog", "Cat", "Bird", "Exotic", "Other"];

const toLocalDate = (dateString) => new Date(`${dateString}T00:00:00`);

const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const todayIso = toIso(new Date());

const getServicePresentation = (service, index) => {
  const label    = service.serviceName.toLowerCase();
  const category = service.category?.toLowerCase() ?? "";
  if (label.includes("groom") || category === "grooming")    return { icon: Scissors,   description: service.description || "Polished coat care with premium finishing touches.", badge: "Glow-up favorite" };
  if (label.includes("vacc")  || category === "vaccination") return { icon: Syringe,    description: service.description || "Protective boosters synced with your record timeline.", badge: "Preventive care" };
  if (label.includes("dent")  || category === "dental")      return { icon: Sparkles,   description: service.description || "Comfort-first dental maintenance and follow-up reminders.", badge: "Fresh breath" };
  if (label.includes("vet")   || category === "vet")         return { icon: Stethoscope,description: service.description || "Consultations, diagnostics, and recovery guidance.", badge: "Most booked" };
  return fallbackServices[index % fallbackServices.length];
};

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, i) => {
    const d = i - startOffset + 1;
    return (d < 1 || d > daysInMonth) ? null : new Date(year, month, d);
  });
};

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

export const ServiceBookingPage = () => {
  const queryClient    = useQueryClient();
  const location       = useLocation();
  const navigate       = useNavigate();
  const { userProfile }= useAuth();
  const { data: petsResponse }         = useMyPets();
  const { data: servicesResponse }     = useServices();
  const { data: myRecordsResponse }    = useMyRecords();
  const { mutateAsync: createAppointment,    isPending }        = useCreateAppointment();
  const { mutateAsync: initiateKhaltiPayment } = useInitiateKhaltiPayment();
  const { mutateAsync: verifyKhaltiPayment } = useVerifyKhaltiPayment();
  const handledPaymentStatusRef = useRef("");
  const [paymentResult, setPaymentResult] = useState(null);

  // ── Step-by-step booking flow: 1 = pick service, 2 = pick date/time, 3 = form + payment ──
  const [bookingStep, setBookingStep] = useState(1);

  // ── Track which specific appointment is being paid (null = none) ──
  const [khaltiPendingId, setKhaltiPendingId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
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

  // ── Build a map of vaccination service name → pending due date ──
  // A vaccination service is locked if the user has a medical record of type
  // "vaccination" with a matching title and a future nextDueDate.
  // Falls back to locking ALL vaccination services if any pending record exists.
  const vaccLockMap = useMemo(() => {
    const records = myRecordsResponse?.data ?? [];
    const now = new Date();
    const map = new Map(); // serviceName (lowercase) → nextDueDate
    for (const r of records) {
      if (r.type === "vaccination" && r.nextDueDate && new Date(r.nextDueDate) > now) {
        const key = r.title?.toLowerCase() ?? "";
        const existing = map.get(key);
        // Keep the earliest due date per service name
        if (!existing || new Date(r.nextDueDate) < new Date(existing)) {
          map.set(key, r.nextDueDate);
        }
      }
    }
    return map;
  }, [myRecordsResponse]);

  const primaryPet = petsResponse?.data?.primaryPet ?? petsResponse?.data?.pets?.[0] ?? null;

  // No auto-select — user must click a service card to proceed to step 2

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
    const pidx          = params.get("pidx");

    if (pidx && !handledPaymentStatusRef.current.startsWith("khalti-" + pidx)) {
      handledPaymentStatusRef.current = "khalti-" + pidx;
      const appointmentId = params.get("appointmentId") ?? "";
      const khaltiStatus  = params.get("status") ?? "";

      if (khaltiStatus === "Completed" && appointmentId) {
        console.log("Verifying Khalti payment for pidx:", pidx, "and appointmentId:", appointmentId);
        verifyKhaltiPayment({ pidx, appointmentId })
          .then((res) => {
            const apt = res.data?.appointment;
            void queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
            void queryClient.invalidateQueries({ queryKey: ["notifications"] });
            setLatestBookingId(apt?.bookingId ?? "");
            setLatestAppointmentId(apt?._id ?? appointmentId);
            setPaymentResult({
              status: "success",
              bookingId: apt?.bookingId ?? "",
              transactionCode: apt?.payment?.transactionCode ?? pidx,
              amount: apt?.payment?.amount ? String(apt.payment.amount) : null,
            });
          })
          .catch((err) => {
            setPaymentResult({ status: "failed", message: err.response?.data?.message || "Payment verification failed." });
          })
          .finally(() => {
            navigate("/services", { replace: true });
          });
      } else {
                console.log("Verifying Khalti payment for pidx2:", pidx, "and appointmentId:", appointmentId);
        const messages = {
          User_canceled: "Payment was cancelled by the user.",
          Expired:       "Payment session expired. Please try again.",
          failed:        "Payment failed. Please try again.",
        };
        setPaymentResult({ status: "failed", message: messages[khaltiStatus] ?? "Payment could not be completed." });
        navigate("/services", { replace: true });
      }
      return;
    }

    const paymentStatus = params.get("payment");
    if (!paymentStatus || handledPaymentStatusRef.current === paymentStatus + location.search) return;
    handledPaymentStatusRef.current = paymentStatus + location.search;

    const bookingId       = params.get("bookingId") ?? "";
    const appointmentId   = params.get("appointmentId") ?? "";
    const transactionCode = params.get("transactionCode") ?? "";
                console.log("Verifying Khalti payment for pidx3:", pidx, "and appointmentId:", appointmentId);

    if (paymentStatus === "success") {
      void queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setLatestBookingId(bookingId);
      setLatestAppointmentId(appointmentId);
      setPaymentResult({ status: "success", bookingId, transactionCode, amount: null });
    } else if (paymentStatus !== "pending") {
      const messages = {
        cancelled: "Payment was cancelled. You can try again.",
        failed:    "Payment failed. Please try again.",
        missing:   "Payment data was missing. Please try again.",
      };
      setPaymentResult({ status: "failed", message: messages[paymentStatus] ?? "Payment could not be completed." });
    }

    navigate("/services", { replace: true });
  }, [location.search, queryClient, navigate, verifyKhaltiPayment]);

  const selectedService = serviceCards.find((s) => (s._id ?? s.key) === selectedServiceKey);
  const calendarDays    = getCalendarDays(calendarMonth.year, calendarMonth.month);
  const monthTitle      = new Date(calendarMonth.year, calendarMonth.month, 1)
    .toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const handlePrevMonth = () => setCalendarMonth(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
  );
  const handleNextMonth = () => setCalendarMonth(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
  );
  // Prevent navigating to months before the current one
  const today = new Date();
  const isPrevMonthDisabled =
    calendarMonth.year < today.getFullYear() ||
    (calendarMonth.year === today.getFullYear() && calendarMonth.month <= today.getMonth());

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

  // ── Fixed: track pending state per appointmentId, not globally ──
  const handleKhaltiPayment = async (appointmentId) => {
    if (khaltiPendingId) return; // already processing one
    setKhaltiPendingId(appointmentId);
    try {
      const response = await initiateKhaltiPayment({ appointmentId });
      const { paymentUrl, appointment } = response.data;
      setLatestAppointmentId(appointment?._id ?? appointmentId);
      setLatestBookingId(appointment?.bookingId ?? latestBookingId);
      window.location.href = paymentUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setKhaltiPendingId(null);
    }
    // Note: don't clear khaltiPendingId on success — page is redirecting away
  };

  return (
    <div className="pet-page">

      <PaymentResultModal
        result={paymentResult}
        onClose={() => {
          setPaymentResult(null);
          void queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
        }}
      />

      {/* ── HEADER ── */}
      <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0D6]">
            <CalendarDays className="h-7 w-7 text-[#F5A623]" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-[#FFE3B3] px-3 py-1 text-xs font-semibold text-[#8B6428]">
              Service Booking
            </span>
            <h1 className="mt-1.5 text-2xl font-bold leading-tight text-[#2D2D2D] sm:text-3xl">
              Book a care appointment
            </h1>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-5 flex items-center gap-2">
          {["Choose service", "Details & Time", "Confirm & Pay"].map((label, i) => {
            const step = i + 1;
            const isActive = bookingStep === step;
            const isDone = bookingStep > step;
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isDone ? "bg-[#F5A623] text-white" : isActive ? "bg-[#2D2D2D] text-white" : "bg-[#F0E8DC] text-[#A97C3A]"
                }`}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : step}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${isActive ? "text-[#2D2D2D]" : "text-[#A97C3A]"}`}>{label}</span>
                {i < 2 && <div className="mx-1 h-px w-6 bg-[#E8D9C4]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: All services ── */}
      {bookingStep === 1 && (
        <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Choose a service</span>
          <p className="mt-1 text-sm text-[#6B6B6B]">Click on any service to see available time slots.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => {
              // Lock this card if it's a vaccination service with a pending due date
              // Match by service name first; fall back to locking all vaccination services
              // if there's any pending record with a generic/unmatched title.
              let lockedUntil = null;
              if (service.category === "vaccination") {
                const nameKey = service.serviceName?.toLowerCase() ?? "";
                if (vaccLockMap.has(nameKey)) {
                  lockedUntil = vaccLockMap.get(nameKey);
                } else if (vaccLockMap.size > 0) {
                  // Any pending vaccination record locks all vaccination services
                  lockedUntil = [...vaccLockMap.values()].sort((a, b) => new Date(a) - new Date(b))[0];
                }
              }
              const isVaccLocked = lockedUntil != null;
              const dueDateStr = isVaccLocked
                ? new Date(lockedUntil).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                : null;

              if (isVaccLocked) {
                return (
                  <div
                    key={service._id ?? service.key}
                    className="rounded-[18px] p-[18px] border-2 border-dashed border-[#E8D9C4] bg-[#FAFAF8] text-left w-full opacity-80 relative overflow-hidden"
                  >
                    {/* Lock overlay badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#FFF3CD] px-2.5 py-1 text-[10px] font-semibold text-[#8B6428]">
                      <Clock3 className="h-3 w-3" /> Due {dueDateStr}
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E8DC]">
                      <service.icon className="h-5 w-5 text-[#C8B8A8]" />
                    </div>
                    <p className="mt-4 text-base font-bold text-[#9B9B9B]">{service.serviceName}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#B8A898]">{service.description}</p>
                    <p className="mt-3 text-xs font-semibold text-[#C8A96A]">
                      Available from {dueDateStr}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xl font-bold text-[#C8B8A8]">{formatNpr(service.price)}</p>
                      <span className="text-xs font-semibold text-[#C8B8A8]">{service.durationMinutes ?? 45} min</span>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={service._id ?? service.key}
                  type="button"
                  onClick={() => {
                    setSelectedServiceKey(service._id ?? service.key);
                    setBookingStep(2);
                  }}
                  className="rounded-[18px] p-[18px] border-2 border-transparent bg-[#FFF8EE] hover:bg-[#FFF0D6] hover:border-[#F5A623]/40 hover:shadow-[0_8px_24px_rgba(245,166,35,0.15)] cursor-pointer transition-all text-left w-full group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm group-hover:bg-[#FFF0D6] transition-colors">
                      <service.icon className="h-5 w-5 text-[#F5A623]" />
                    </div>
                    <span className="rounded-full bg-[#FFE8B8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B6428]">
                      {service.badge}
                    </span>
                  </div>
                  <p className="mt-4 text-base font-bold text-[#2D2D2D]">{service.serviceName}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6B6B6B]">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {service.discountPrice != null && service.discountPrice < service.price ? (
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-bold text-emerald-600">{formatNpr(service.discountPrice)}</p>
                          <p className="text-sm line-through text-[#9B9B9B]">{formatNpr(service.price)}</p>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-[#2D2D2D]">{formatNpr(service.price)}</p>
                      )}
                      {service.discountTitle && service.discountPrice != null && (
                        <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {service.discountTitle}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#9B9B9B]">{service.durationMinutes ?? 45} min</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2: Timetable + Pet details (side by side) ── */}
      {bookingStep === 2 && selectedService && (
        <div className="space-y-6">
          {/* Service summary bar */}
          <div className="inline-flex items-center gap-4 rounded-2xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-5 py-4 text-white shadow-[0_6px_20px_rgba(245,166,35,0.25)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <selectedService.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Selected service</p>
              <p className="mt-0.5 text-base font-bold leading-tight">{selectedService.serviceName}</p>
              <div className="mt-1 flex items-baseline gap-2">
                {selectedService.discountPrice != null && selectedService.discountPrice < selectedService.price ? (
                  <>
                    <span className="text-sm font-bold">{formatNpr(selectedService.discountPrice)}</span>
                    <span className="text-xs line-through text-white/60">{formatNpr(selectedService.price)}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold">{formatNpr(selectedService.price)}</span>
                )}
                <span className="text-xs text-white/70">· {selectedService.durationMinutes ?? 45} min</span>
              </div>
            </div>
          </div>

          {/* Calendar/slots + Pet details side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT — Calendar + Time slots */}
            <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Pick a date &amp; time</span>

              {/* Calendar */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#2D2D2D]">{monthTitle}</h2>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={isPrevMonthDisabled}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF8EE] text-[#5B4A36] hover:bg-[#FFE9A8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF8EE] text-[#5B4A36] hover:bg-[#FFE9A8] transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[#A97C3A]">
                  {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => <span key={d}>{d}</span>)}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (!day) return <span key={`e-${i}`} />;
                    const iso = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`;
                    const isSel = iso === selectedDate;
                    const isPast = iso < todayIso;
                    const isSunday = day.getDay() === 0;
                    const isDisabled = isPast || isSunday;
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(iso)}
                        className={`aspect-square min-h-[36px] flex items-center justify-center text-[13px] font-semibold transition-all rounded-xl ${
                          isDisabled
                            ? "text-[#C8B8A8] cursor-not-allowed"
                            : isSel
                            ? "bg-[#2D2D2D] text-white cursor-pointer"
                            : "bg-[#FFF8EE] text-[#5B4A36] hover:bg-[#FFE9A8] cursor-pointer"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots — below calendar */}
              <div className="mt-6 border-t border-[#F0E8DC] pt-5">
                <p className="text-sm font-semibold text-[#2D2D2D]">
                  Available slots for{" "}
                  <span className="text-[#F5A623]">
                    {toLocalDate(selectedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {slotOptions.map((slot) => {
                    const [h, m] = slot.split(":").map(Number);
                    const label = new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all rounded-2xl border-2 ${
                          selectedSlot === slot
                            ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_4px_12px_rgba(245,166,35,0.25)] border-transparent"
                            : "bg-white text-[#5B4A36] border-[#E8D9C4] hover:border-[#F5A623]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — Pet details form */}
            <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Your details</span>
                  <h2 className="mt-2 text-xl font-bold text-[#2D2D2D]">Owner &amp; pet information</h2>
                </div>
                <ClipboardList className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                    <UserRound className="h-3.5 w-3.5 text-[#F5A623]" />Owner name
                  </label>
                  <input type="text" value={bookingForm.ownerName} onChange={handleFieldChange("ownerName")} placeholder="Full name" className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062]" required />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#F5A623]" />Contact number
                  </label>
                  <input type="tel" value={bookingForm.contactNumber} onChange={handleFieldChange("contactNumber")} placeholder="+977 98XXXXXXXX" className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062]" required />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                    <PawPrint className="h-3.5 w-3.5 text-[#F5A623]" />Pet name
                  </label>
                  <input type="text" value={bookingForm.petName} onChange={handleFieldChange("petName")} placeholder="Your pet's name" className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062]" required />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                    <Hash className="h-3.5 w-3.5 text-[#F5A623]" />Pet type
                  </label>
                  <select value={bookingForm.petType} onChange={handleFieldChange("petType")} className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] appearance-none cursor-pointer" required>
                    {petTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                    <NotebookPen className="h-3.5 w-3.5 text-[#F5A623]" />Notes for the visit
                  </label>
                  <textarea value={bookingForm.note} onChange={handleFieldChange("note")} placeholder="Allergies, behaviour notes, symptoms, or anything helpful for the visit" rows={3} className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062] resize-none" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FFF8EE] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">PetHub ID</p>
                  <p className="mt-1 text-sm font-semibold text-[#2D2D2D]">{userProfile?.petHubId ?? "Assigned after profile sync"}</p>
                </div>
                <div className="rounded-2xl bg-[#FFF8EE] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Account email</p>
                  <p className="mt-1 truncate text-sm font-semibold text-[#2D2D2D]">{userProfile?.email ?? "Signed-in account"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setBookingStep(1)}
              className="flex items-center gap-2 rounded-full border-2 border-[#E8D9C4] bg-white px-5 py-2.5 text-sm font-semibold text-[#6B6B6B] hover:border-[#F5A623] hover:text-[#2D2D2D] transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setBookingStep(3)}
              className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(245,166,35,0.3)] hover:opacity-90 transition-all"
            >
              Proceed to Booking <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Booking summary + Payment ── */}
      {bookingStep === 3 && selectedService && (
        <div className="mx-auto max-w-lg space-y-6">
          {/* Summary card */}
          <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Booking summary</span>
            <div className="mt-5 space-y-2.5">
              {[
                { label: "Service",         value: selectedService.serviceName },
                { label: "Date",            value: toLocalDate(selectedDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) },
                { label: "Time",            value: selectedSlot },
                { label: "Pet",             value: bookingForm.petName ? `${bookingForm.petName} (${bookingForm.petType})` : "—" },
                { label: "Owner",           value: bookingForm.ownerName || "—" },
                { label: "Estimated total", value: selectedService.discountPrice != null && selectedService.discountPrice < selectedService.price
                    ? `${formatNpr(selectedService.discountPrice)} (was ${formatNpr(selectedService.price)})`
                    : formatNpr(selectedService.price) },
                { label: "Booking ID",      value: latestBookingId || "Generated on confirm" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-[#FFF8EE] px-4 py-3">
                  <span className="text-sm text-[#6B6B6B]">{label}</span>
                  <span className="text-sm font-semibold text-[#2D2D2D] text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-[linear-gradient(140deg,#2D2D2D,#4A3828)] p-4 text-white">
              <div className="flex items-center gap-2.5">
                <ShieldPlus className="h-5 w-5 text-[#FFB347] shrink-0" />
                <p className="text-sm font-semibold">NPR only · Khalti sandbox</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                PetHub reserves the booking, then you pay securely via Khalti. Use test number <strong>9800000005</strong> and MPIN <strong>1111</strong>.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:opacity-90 transition-all disabled:opacity-50 w-full"
              >
                {isPending ? "Reserving…" : "Reserve appointment"}
                {isPending ? <Clock3 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </button>

              {latestAppointmentId && (
                <button
                  type="button"
                  onClick={() => handleKhaltiPayment(latestAppointmentId)}
                  disabled={khaltiPendingId !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8C4F0] bg-white px-6 py-3 text-sm font-semibold text-[#5C2D91] hover:bg-[#F5EEFF] transition-colors disabled:opacity-50 w-full"
                >
                  <WalletCards className="h-4 w-4" />
                  {khaltiPendingId === latestAppointmentId ? "Redirecting to Khalti…" : "Pay with Khalti"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setBookingStep(2)}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-[#E8D9C4] bg-white px-5 py-2.5 text-sm font-semibold text-[#6B6B6B] hover:border-[#F5A623] hover:text-[#2D2D2D] transition-all w-full"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};