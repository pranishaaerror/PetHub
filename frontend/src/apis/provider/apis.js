import { axiosInstance } from "../axios";

export const getVetAppointments = () => axiosInstance.get("/provider/vet/appointments");

export const getVetSchedule = (date) =>
  axiosInstance.get("/provider/vet/schedule", { params: date ? { date } : {} });

export const acceptVetAppointment = (id) =>
  axiosInstance.patch(`/provider/vet/appointments/${id}/accept`);

export const rejectVetAppointment = (id) =>
  axiosInstance.patch(`/provider/vet/appointments/${id}/reject`);

export const updateVetConsultation = (id, data) =>
  axiosInstance.patch(`/provider/vet/appointments/${id}/consultation`, data);

export const uploadVetMedicalReport = (id, file) => {
  const form = new FormData();
  form.append("report", file);
  return axiosInstance.post(`/provider/vet/appointments/${id}/medical-report`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getVetPetMedicalRecords = (petId) =>
  axiosInstance.get(`/provider/vet/pets/${petId}/medical-records`);

export const createVetMedicalRecord = (data) =>
  axiosInstance.post("/provider/vet/medical-records", data);

export const getVetPaymentSummary = () => axiosInstance.get("/provider/vet/payments/summary");

export const getGroomerBookings = () => axiosInstance.get("/provider/groomer/bookings");

export const getGroomerSchedule = (date) =>
  axiosInstance.get("/provider/groomer/schedule", { params: date ? { date } : {} });

export const acceptGroomerBooking = (id) =>
  axiosInstance.patch(`/provider/groomer/bookings/${id}/accept`);

export const rejectGroomerBooking = (id) =>
  axiosInstance.patch(`/provider/groomer/bookings/${id}/reject`);

export const updateGroomerBookingNotes = (id, serviceNotes) =>
  axiosInstance.patch(`/provider/groomer/bookings/${id}/notes`, { serviceNotes });

export const completeGroomerBooking = (id, payload = {}) =>
  axiosInstance.patch(`/provider/groomer/bookings/${id}/complete`, payload);

export const getGroomerPaymentSummary = () =>
  axiosInstance.get("/provider/groomer/payments/summary");
