import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptGroomerBooking,
  acceptVetAppointment,
  completeGroomerBooking,
  createVetMedicalRecord,
  getGroomerBookings,
  getGroomerPaymentSummary,
  getGroomerSchedule,
  getVetAppointments,
  getVetPaymentSummary,
  getVetPetMedicalRecords,
  getVetSchedule,
  rejectGroomerBooking,
  rejectVetAppointment,
  updateGroomerBookingNotes,
  updateVetConsultation,
  uploadVetMedicalReport,
} from "./apis";

export const useVetAppointments = (options = {}) =>
  useQuery({
    queryKey: ["provider", "vet", "appointments"],
    queryFn: () => getVetAppointments().then((r) => r.data),
    ...options,
  });

export const useVetSchedule = (date, options = {}) =>
  useQuery({
    queryKey: ["provider", "vet", "schedule", date ?? "today"],
    queryFn: () => getVetSchedule(date).then((r) => r.data),
    ...options,
  });

export const useVetPaymentSummary = (options = {}) =>
  useQuery({
    queryKey: ["provider", "vet", "payments"],
    queryFn: () => getVetPaymentSummary().then((r) => r.data),
    ...options,
  });

export const useVetPetMedicalRecords = (petId, options = {}) =>
  useQuery({
    queryKey: ["provider", "vet", "pet-records", petId],
    queryFn: () => getVetPetMedicalRecords(petId).then((r) => r.data),
    enabled: Boolean(petId),
    ...options,
  });

export const useGroomerBookings = (options = {}) =>
  useQuery({
    queryKey: ["provider", "groomer", "bookings"],
    queryFn: () => getGroomerBookings().then((r) => r.data),
    ...options,
  });

export const useGroomerSchedule = (date, options = {}) =>
  useQuery({
    queryKey: ["provider", "groomer", "schedule", date ?? "today"],
    queryFn: () => getGroomerSchedule(date).then((r) => r.data),
    ...options,
  });

export const useGroomerPaymentSummary = (options = {}) =>
  useQuery({
    queryKey: ["provider", "groomer", "payments"],
    queryFn: () => getGroomerPaymentSummary().then((r) => r.data),
    ...options,
  });

export const useVetAppointmentMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["provider", "vet"] });
  };

  const accept = useMutation({
    mutationFn: (id) => acceptVetAppointment(id).then((r) => r.data),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: (id) => rejectVetAppointment(id).then((r) => r.data),
    onSuccess: invalidate,
  });

  const consultation = useMutation({
    mutationFn: ({ id, ...body }) => updateVetConsultation(id, body).then((r) => r.data),
    onSuccess: invalidate,
  });

  const report = useMutation({
    mutationFn: ({ id, file }) => uploadVetMedicalReport(id, file).then((r) => r.data),
    onSuccess: invalidate,
  });

  const medicalRecord = useMutation({
    mutationFn: (body) => createVetMedicalRecord(body).then((r) => r.data),
    onSuccess: (_data, variables) => {
      invalidate();
      if (variables?.petId) {
        qc.invalidateQueries({ queryKey: ["provider", "vet", "pet-records", variables.petId] });
      }
    },
  });

  return { accept, reject, consultation, report, medicalRecord };
};

export const useGroomerBookingMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["provider", "groomer"] });
  };

  const accept = useMutation({
    mutationFn: (id) => acceptGroomerBooking(id).then((r) => r.data),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: (id) => rejectGroomerBooking(id).then((r) => r.data),
    onSuccess: invalidate,
  });

  const notes = useMutation({
    mutationFn: ({ id, serviceNotes }) =>
      updateGroomerBookingNotes(id, serviceNotes).then((r) => r.data),
    onSuccess: invalidate,
  });

  const complete = useMutation({
    mutationFn: ({ id, serviceNotes }) =>
      completeGroomerBooking(id, { serviceNotes }).then((r) => r.data),
    onSuccess: invalidate,
  });

  return { accept, reject, notes, complete };
};
