import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Blank from "./pages/Blank";
import Services from "./pages/Services/Services";
import Clients from "./pages/Clients/Clients";
import Employees from "./pages/Employees/Employees";
import Orders from "./pages/Orders/Orders";
import Projects from "./pages/Projects/Projects";
import AppLayout from "./layout/AppLayout";
import PublicLayout from "./layout/PublicLayout";
import PublicHome from "./pages/public/PublicHome";
import PublicServices from "./pages/public/PublicServices";
import PublicServiceDetail from "./pages/public/PublicServiceDetail";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHome />} />
          <Route path="/services" element={<PublicServices />} />
          <Route path="/services/:id" element={<PublicServiceDetail />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
        </Route>

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Authentication required */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            <Route path="/dashboard" element={<Home />} />

            {/* Admin + Employee */}
            <Route
              element={
                <RoleRoute allowedRoles={["ADMIN", "EMPLOYEE"]} />
              }
            >
              <Route path="/clients" element={<Clients />} />
            </Route>

            {/* Admin + Employee + Client */}
            <Route
              element={
                <RoleRoute allowedRoles={["ADMIN", "EMPLOYEE", "CLIENT"]} />
              }
            >
              <Route path="/projects" element={<Projects />} />
            </Route>

            {/* Admin only */}
            <Route
              element={
                <RoleRoute
                  allowedRoles={["ADMIN", "EMPLOYEE", "CLIENT"]}
                />
              }
            >
              <Route path="/employees" element={<Employees />} />
            </Route>

            {/* Admin only */}
            <Route
              element={<RoleRoute allowedRoles={["ADMIN"]} />}
            >
              <Route path="/reports" element={<Blank />} />
            </Route>

            {/* All authenticated users */}
            <Route
              element={
                <RoleRoute
                  allowedRoles={["ADMIN", "EMPLOYEE", "CLIENT"]}
                />
              }
            >
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* Services */}
            <Route path="/dashboard/services" element={<Services />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}