import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import {
  CalendarDays, Check, CheckCircle2, ClipboardList, Clock3, Hash,
  NotebookPen, PawPrint, Phone, Scissors, ShieldPlus,
  Sparkles, Stethoscope, Syringe, WalletCards, UserRound,
  XCircle, X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useCreateAppointment, useAppointment } from "../apis/appointment/hooks";
import { useMyPets } from "../apis/pets/hooks";
import { useServices } from "../apis/services/hooks";
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
  const navigate       = useNavigate();
  const { userProfile }= useAuth();
  const { data: petsResponse }         = useMyPets();
  const { data: servicesResponse }     = useServices();
  const { data: appointmentsResponse, isLoading: isAppointmentsLoading } = useAppointment();
  const { mutateAsync: createAppointment,    isPending }        = useCreateAppointment();
  const { mutateAsync: initiateKhaltiPayment } = useInitiateKhaltiPayment();
  const { mutateAsync: verifyKhaltiPayment } = useVerifyKhaltiPayment();
  const handledPaymentStatusRef = useRef("");
  const [paymentResult, setPaymentResult] = useState(null);

  // ── Track which specific appointment is being paid (null = none) ──
  const [khaltiPendingId, setKhaltiPendingId] = useState(null);

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
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B6B6B]">
          Services come from the backend catalog. Each appointment gets a booking ID, and owner, pet, and contact details are saved for real follow-up.
        </p>
      </div>

      {/* ── MAIN BOOKING GRID ── */}
      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">

        {/* LEFT — Service picker + Calendar + Form */}
        <div className="space-y-6">

          {/* Service cards */}
          <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Choose a service</span>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {serviceCards.map((service) => {
                const isSelected = (service._id ?? service.key) === selectedServiceKey;
                return (
                  <button
                    key={service._id ?? service.key}
                    type="button"
                    onClick={() => setSelectedServiceKey(service._id ?? service.key)}
                    className={`rounded-[18px] p-[18px] border-2 cursor-pointer transition-all text-left w-full ${
                      isSelected
                        ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_12px_32px_rgba(245,166,35,0.28)] border-transparent"
                        : "bg-[#FFF8EE] hover:bg-[#FFF0D6] border-transparent hover:border-[#F5A623]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? "bg-white/20" : "bg-white shadow-sm"}`}>
                        <service.icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-[#F5A623]"}`} />
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${isSelected ? "bg-white/20 text-white" : "bg-[#FFE8B8] text-[#8B6428]"}`}>
                        {service.badge}
                      </span>
                    </div>
                    <p className={`mt-4 text-base font-bold ${isSelected ? "text-white" : "text-[#2D2D2D]"}`}>{service.serviceName}</p>
                    <p className={`mt-1.5 text-xs leading-relaxed ${isSelected ? "text-white/80" : "text-[#6B6B6B]"}`}>{service.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className={`text-xl font-bold ${isSelected ? "text-white" : "text-[#2D2D2D]"}`}>
                        {formatNpr(service.price)}
                      </p>
                      <span className={`text-xs font-semibold ${isSelected ? "text-white/75" : "text-[#9B9B9B]"}`}>
                        {service.durationMinutes ?? 45} min
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar + Slots */}
          <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-[1fr_auto]">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Pick a date</span>
                    <h2 className="mt-2 text-xl font-bold text-[#2D2D2D]">{monthTitle}</h2>
                  </div>
                  <CalendarDays className="h-6 w-6 text-[#F5A623]" />
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[#A97C3A]">
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
                        className={`aspect-square min-h-[36px] flex items-center justify-center text-[13px] font-semibold cursor-pointer transition-all ${
                          isSel
                            ? "bg-[#2D2D2D] text-white rounded-xl"
                            : "bg-[#FFF8EE] text-[#5B4A36] rounded-xl hover:bg-[#FFE9A8]"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots */}
              <div className="min-w-[140px]">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Time slot</span>
                <div className="mt-4 grid gap-2">
                  {slotOptions.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold cursor-pointer transition-all border-2 ${
                        selectedSlot === slot
                          ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white rounded-2xl shadow-[0_4px_12px_rgba(245,166,35,0.3)] border-transparent"
                          : "bg-[#FFF8EE] text-[#5B4A36] rounded-2xl hover:border-[#F5A623] border-transparent"
                      }`}
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
          <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Your details</span>
                <h2 className="mt-2 text-xl font-bold text-[#2D2D2D]">Owner &amp; pet information</h2>
              </div>
              <ClipboardList className="h-6 w-6 text-[#F5A623]" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* Owner name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                  <UserRound className="h-3.5 w-3.5 text-[#F5A623]" />Owner name
                </label>
                <input
                  type="text"
                  value={bookingForm.ownerName}
                  onChange={handleFieldChange("ownerName")}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062]"
                  required
                />
              </div>
              {/* Contact */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#F5A623]" />Contact number
                </label>
                <input
                  type="tel"
                  value={bookingForm.contactNumber}
                  onChange={handleFieldChange("contactNumber")}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062]"
                  required
                />
              </div>
              {/* Pet name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                  <PawPrint className="h-3.5 w-3.5 text-[#F5A623]" />Pet name
                </label>
                <input
                  type="text"
                  value={bookingForm.petName}
                  onChange={handleFieldChange("petName")}
                  placeholder="Your pet's name"
                  className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062]"
                  required
                />
              </div>
              {/* Pet type */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                  <Hash className="h-3.5 w-3.5 text-[#F5A623]" />Pet type
                </label>
                <select
                  value={bookingForm.petType}
                  onChange={handleFieldChange("petType")}
                  className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062] appearance-none cursor-pointer"
                  required
                >
                  {petTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Notes — full width */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#A97C3A] mb-1.5">
                  <NotebookPen className="h-3.5 w-3.5 text-[#F5A623]" />Notes for the visit
                </label>
                <textarea
                  value={bookingForm.note}
                  onChange={handleFieldChange("note")}
                  placeholder="Allergies, behaviour notes, symptoms, or anything helpful for the visit"
                  rows={3}
                  className="w-full rounded-2xl border border-transparent bg-[#FFF8EE] px-4 py-3 text-sm text-[#2D2D2D] outline-none ring-2 ring-transparent transition placeholder:text-[#A89882] focus:ring-[#F5C062] resize-none"
                />
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

        <div className="space-y-6">

          <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Booking summary</span>
            <div className="mt-5 space-y-2.5">
              {[
                { label: "Service",        value: selectedService?.serviceName ?? "Choose one" },
                { label: "Date",           value: toLocalDate(selectedDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) },
                { label: "Time",           value: selectedSlot },
                { label: "Estimated total",value: selectedService ? formatNpr(selectedService.price) : "--" },
                { label: "Booking ID",     value: latestBookingId || "Generated on confirm" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-[#FFF8EE] px-4 py-3">
                  <span className="text-sm leading-7 text-[#6B6B6B]">{label}</span>
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
                PetHub reserves the booking, then you pay securely in NPR via Khalti sandbox. Use test number <strong>9800000005</strong> and MPIN <strong>1111</strong>. Admin will confirm your booking after payment.
              </p>
            </div>

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:opacity-90 transition-all disabled:opacity-50 mt-5 w-full"
            >
              {isPending ? "Reserving…" : "Reserve appointment"}
              {isPending ? <Clock3 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </button>

            {latestAppointmentId && (
              <div className="mt-4 rounded-2xl border border-[#E8D9C4] bg-[#FFF8EE] p-4">
                <div className="flex items-center gap-2.5">
                  <WalletCards className="h-5 w-5 text-[#5C2D91]" />
                  <p className="text-sm font-semibold text-[#2D2D2D]">Pay with Khalti sandbox</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#6B6B6B]">
                  Test with Khalti number <strong>9800000005</strong> and MPIN <strong>1111</strong>. Sandbox only, billed in NPR.
                </p>
                <button
                  type="button"
                  onClick={() => handleKhaltiPayment(latestAppointmentId)}
                  disabled={khaltiPendingId !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8C4F0] bg-white px-6 py-3 text-sm font-semibold text-[#5C2D91] hover:bg-[#F5EEFF] transition-colors disabled:opacity-50 mt-4 w-full"
                >
                  <WalletCards className="h-4 w-4" />
                  {khaltiPendingId === latestAppointmentId ? "Redirecting to Khalti…" : "Pay with Khalti sandbox"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">Live bookings</span>
            <h2 className="mt-2 text-2xl font-bold text-[#2D2D2D]">Your upcoming appointments</h2>
          </div>
          <ClipboardList className="h-6 w-6 text-[#F5A623]" />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isAppointmentsLoading ? (
            <div className="col-span-full rounded-2xl bg-[#FFF8EE] p-5 text-sm text-[#6B6B6B]">
              Loading appointments…
            </div>
          ) : upcomingAppointments.length ? (
            upcomingAppointments.map((apt) => {
              const s = bookingStatusConfig[apt.status] ?? { bg: "#F5F5F5", text: "#555", dot: "#999" };
              const isThisCardPending = khaltiPendingId === apt._id;
              const isAnyPending = khaltiPendingId !== null;
              return (
                <article key={apt._id} className="rounded-[24px] bg-white shadow-[0_4px_18px_rgba(45,45,45,0.07)] overflow-hidden">
                  <div className="h-1 w-full" style={{ background: s.dot }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#FFE3B3] px-3 py-1 text-xs font-semibold text-[#8B6428]">{apt.bookingId}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: s.bg, color: s.text }}>{apt.status}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-[#2D2D2D]">{apt.petName}</h3>
                    <p className="mt-1 text-xs text-[#6B6B6B]">{apt.serviceId?.serviceName} · {apt.petType}</p>
                    <div className="mt-3 space-y-1 text-xs text-[#6B6B6B]">
                      <p><span className="font-semibold text-[#2D2D2D]">When</span> · {formatAppointmentMoment(apt.appointmentTime)}</p>
                      <p><span className="font-semibold text-[#2D2D2D]">Owner</span> · {apt.ownerName}</p>
                      <p><span className="font-semibold text-[#2D2D2D]">Amount</span> · {formatNpr(apt.payment?.amount)}</p>
                      <p>
                        <span className="font-semibold text-[#2D2D2D]">Payment</span> ·{" "}
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
                        <button
                          type="button"
                          onClick={() => handleKhaltiPayment(apt._id)}
                          disabled={isAnyPending}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8C4F0] bg-white px-6 py-3 text-sm font-semibold text-[#5C2D91] hover:bg-[#F5EEFF] transition-colors disabled:opacity-50 w-full text-xs py-2.5"
                        >
                          <WalletCards className="h-3.5 w-3.5" />
                          {isThisCardPending ? "Redirecting…" : "Pay with Khalti"}
                        </button>
                      ) : (
                        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8F5E9] py-2.5 text-xs font-semibold text-[#2E7D32]">
                          <CheckCircle2 className="h-4 w-4" /> Paid in NPR
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl bg-[#FFF8EE] p-6 text-center text-sm text-[#6B6B6B]">
              No live appointments yet. Confirm one above and it will appear here with its booking ID.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};