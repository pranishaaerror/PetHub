import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard} from "./Dashboard/AdminDashboard";
import { ServiceManagement } from "./pages/ServiceManagement";
import { CreateSetvices } from "./pages/CreateServices";
import { Appointments} from "./pages/Appointments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path ="/admin" element= {<AdminDashboard />}/>
        <Route path ="/services" element= {<ServiceManagement/>}/>
        <Route path ="/services/create" element={<CreateSetvices/>}/>
        <Route path="/appointments" element= {<Appointments/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
