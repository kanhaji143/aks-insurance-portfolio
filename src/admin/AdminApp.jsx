import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthChange } from "../services/authService";
import AdminLogin from "./Login";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Companies from "./Companies";
import Plans from "./Plans";
import CalculatorsAdmin from "./CalculatorsAdmin";
import VideosAdmin from "./VideosAdmin";

export default function AdminApp() {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  if (user === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-soft-white text-navy">
        <div className="text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout user={user} />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="plans" element={<Plans />} />
        <Route path="calculators" element={<CalculatorsAdmin />} />
        <Route path="videos" element={<VideosAdmin />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}