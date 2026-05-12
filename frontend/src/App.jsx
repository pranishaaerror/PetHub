import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { ToastContainer } from 'react-toastify';
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { LogoutPage} from "./pages/LogoutPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import OtpVerification from "./pages/OtpVerification";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MedicalRecordsPage } from "./pages/MedicalRecordsPage";
import { MedicalUploadPage } from "./pages/MedicalUploadPage";
import { ServiceBookingPage } from "./pages/ServiceBookingPage";
import { AdoptionGalleryPage } from "./pages/AdoptionGalleryPage";
import { AdoptionPetDetailPage } from "./pages/AdoptionPetDetailPage";
import { AdoptionRequestPage } from "./pages/AdoptionRequestPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CommunityMeetupPage } from "./pages/CommunityMeetupPage";
import { CommunityConversationPage } from "./pages/CommunityConversationPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PetProfilePage } from "./pages/PetProfilePage";
import { UserAppointmentsPage } from "./pages/UserAppointmentsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminAppointmentsPage } from "./pages/AdminAppointmentsPage";
import { AdminServicesPage } from "./pages/AdminServicesPage";
import { AdminAdoptionRequestsPage } from "./pages/AdminAdoptionRequestsPage";
import { AdminAdoptionPetsPage } from "./pages/AdminAdoptionPetsPage";
import { AdminCommunityPage } from "./pages/AdminCommunityPage";
import ServiceBooking from "./pages/main/ServiceBooking";
import Adoption from "./pages/main/Adoption";
import { ProviderLayout } from "./layouts/ProviderLayout";
import { ProviderDashboardPage } from "./pages/provider/ProviderDashboardPage";
import { ProviderBookingsPage } from "./pages/provider/ProviderBookingsPage";
import { ProviderPaymentsPage } from "./pages/provider/ProviderPaymentsPage";
import { ProviderProfilePage } from "./pages/provider/ProviderProfilePage";
import { AdoptionHistoryPage } from "./pages/history/AdoptionHistoryPage";
import { PaymentHistoryPage } from "./pages/history/PaymentHistoryPage";
import { CommunityHistoryPage } from "./pages/history/CommunityHistoryPage";
import Community from "./pages/main/Community";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/service-booking" element={<ServiceBooking/>} />
        <Route path="/adoption" element={<Adoption/>} />
        <Route path="/community" element={<Community />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-signup" element={<OtpVerification />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute allowIncompleteOnboarding redirectIfCompletedTo="/dashboard">
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]} allowIncompleteOnboarding>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="adoption-requests" element={<AdminAdoptionRequestsPage />} />
          <Route path="adoption-pets" element={<AdminAdoptionPetsPage />} />
          <Route path="community" element={<AdminCommunityPage />} />
        </Route>
        <Route
          path="/vet"
          element={
            <ProtectedRoute allowedRoles={["veterinarian"]} allowIncompleteOnboarding>
              <ProviderLayout portal="vet" />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProviderDashboardPage />} />
          <Route path="bookings" element={<ProviderBookingsPage />} />
          <Route path="payments" element={<ProviderPaymentsPage />} />
          <Route path="profile" element={<ProviderProfilePage />} />
        </Route>
        <Route
          path="/groomer"
          element={
            <ProtectedRoute allowedRoles={["groomer"]} allowIncompleteOnboarding>
              <ProviderLayout portal="groomer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProviderDashboardPage />} />
          <Route path="bookings" element={<ProviderBookingsPage />} />
          <Route path="payments" element={<ProviderPaymentsPage />} />
          <Route path="profile" element={<ProviderProfilePage />} />
        </Route>
        <Route
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pet-profile" element={<PetProfilePage />} />
          <Route path="appointments" element={<UserAppointmentsPage />} />
          <Route path="services" element={<ServiceBookingPage />} />
          <Route path="medical-records" element={<MedicalRecordsPage />} />
          <Route path="medical-records/upload" element={<MedicalUploadPage />} />
          <Route path="history/adoption" element={<AdoptionHistoryPage />} />
          <Route path="history/payments" element={<PaymentHistoryPage />} />
          <Route path="history/community" element={<CommunityHistoryPage />} />
          <Route path="dashboard/service-booking" element={<Navigate to="/services" replace />} />
          <Route path="dashboard/adoption" element={<AdoptionGalleryPage />} />
          <Route path="dashboard/adoption/:petId" element={<AdoptionPetDetailPage />} />
          <Route path="dashboard/adoption/:petId/request" element={<AdoptionRequestPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="dashboard/community" element={<CommunityPage />} />
          <Route path="community/meetups/:slug" element={<CommunityMeetupPage />} />
          <Route path="community/conversations/:mode" element={<CommunityConversationPage />} />
          <Route path="community/conversations/:mode/:slug" element={<CommunityConversationPage />} />
        </Route>
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    <ToastContainer/>
    </>
  );
}

export default App;