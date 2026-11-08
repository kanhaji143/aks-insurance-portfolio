import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOutAdmin } from "../services/authService";
import { useState } from "react";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/plans", label: "Insurance Plans" },
  { to: "/admin/calculators", label: "Calculator Links" },
  { to: "/admin/videos", label: "YouTube Videos" },
];

export default function AdminLayout({ user }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOutAdmin();
    navigate("/admin/login", { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-navy text-white"
        : "text-navy/80 hover:bg-soft-white hover:text-navy"
    }`;

  return (
    <div className="flex min-h-dvh bg-soft-white text-navy">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 border-r border-navy/10 bg-white md:block">
        <div className="px-5 py-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-navy/60">Admin Panel</div>
          <div className="mt-1 text-sm font-bold text-navy">AKS Insurance</div>
        </div>
        <nav className="px-3 pb-6" aria-label="Admin navigation">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass} end={n.to === "dashboard"}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-navy/10 px-3 py-4">
          <div className="truncate px-3 text-xs text-navy/60">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-navy/80 hover:bg-soft-white hover:text-navy"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-navy/10 bg-white px-4 py-3">
        <span className="text-sm font-bold text-navy">Admin Panel</span>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-lg border border-navy/10 px-3 py-1 text-sm"
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <nav aria-label="Admin navigation (mobile)">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-navy/80 hover:bg-soft-white"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 pt-16 md:pt-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}