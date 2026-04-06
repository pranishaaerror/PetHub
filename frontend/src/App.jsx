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
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminAppointmentsPage } from "./pages/AdminAppointmentsPage";
import { AdminServicesPage } from "./pages/AdminServicesPage";
import { AdminAdoptionRequestsPage } from "./pages/AdminAdoptionRequestsPage";
import ServiceBooking from "./pages/main/ServiceBooking";
import Adoption from "./pages/main/Adoption";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/service-booking" element={<ServiceBooking/>} />
        <Route path="/adoption" element={<Adoption/>} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="medical-records" element={<MedicalRecordsPage />} />
          <Route path="medical-records/upload" element={<MedicalUploadPage />} />
          <Route path="dashboard/service-booking" element={<ServiceBookingPage />} />
          <Route path="dashboard/adoption" element={<AdoptionGalleryPage />} />
          <Route path="dashboard/adoption/:petId" element={<AdoptionPetDetailPage />} />
          <Route path="dashboard/adoption/:petId/request" element={<AdoptionRequestPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="community/meetups/:slug" element={<CommunityMeetupPage />} />
          <Route path="community/conversations/:mode" element={<CommunityConversationPage />} />
          <Route path="community/conversations/:mode/:slug" element={<CommunityConversationPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
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
