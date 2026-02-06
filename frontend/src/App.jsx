import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AIInsights from "./pages/AIInsights.jsx";
import Users from "./pages/Users.jsx";
import Features from "./pages/Features.jsx";
import Login from "./pages/Login.jsx";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/ai" element={<RequireAuth><AIInsights /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
            <Route path="/features" element={<RequireAuth><Features /></RequireAuth>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
