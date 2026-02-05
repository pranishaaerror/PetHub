import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard} from "./Dashboard/AdminDashboard";
import { ServiceManagement } from "./pages/ServiceManagement";
import { CreateSetvices } from "./pages/CreateServices";
import { Appointments} from "./pages/Appointments";
import { ToastContainer } from 'react-toastify';
import { MainLayout } from "./layouts/MainLayout";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { LogoutPage} from "./pages/LogoutPage";
import { Groomer} from "./pages/Groomer";
import { Adoption } from "./pages/Adoption";
function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        <Route path="/admin" element={<ProtectedRoute><MainLayout/></ProtectedRoute>}>
          <Route index element= {<AdminDashboard />}/>
          <Route path ="services" element= {<ServiceManagement/>}/>
          <Route path ="services/create" element={<CreateSetvices/>}/>
          <Route path="appointments" element= {<Appointments/>}/>
          <Route path = "groomer" element= {<Groomer/>}/>
          <Route path = "adoption" element = {<Adoption/>}/>
        
        </Route>

      </Routes>
    </BrowserRouter>
    <ToastContainer/>
    </>
  );
}

export default App;
