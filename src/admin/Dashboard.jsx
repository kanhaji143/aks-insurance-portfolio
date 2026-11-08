import { useEffect, useState } from "react";
import { adminRepository } from "../services/adminRepository";
import { StatusBadge } from "./ui";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminRepository
      .getDashboardStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Failed to load stats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-sm text-navy/70">Loading dashboard…</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>;
  if (!stats) return null;

  const cards = [
    { label: "Insurance Companies", value: stats.companies, sub: `${stats.publishedCompanies} published` },
    { label: "Insurance Plans", value: stats.plans, sub: `${stats.publishedPlans} published` },
    { label: "Calculator Links", value: stats.links, sub: `${stats.publishedLinks} published` },
    { label: "YouTube Videos", value: stats.videos, sub: `${stats.publishedVideos} published` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-navy/70">Live counts from Firestore.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-navy/70">{c.label}</div>
            <div className="mt-2 text-3xl font-bold text-navy">{c.value}</div>
            <div className="mt-1 text-xs text-navy/60">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-5 text-sm text-navy/70">
        Note: Counts reflect all documents in Firestore. Public visitors only see
        documents where <code>isPublished</code> and <code>isVerified</code> are both true.
      </div>
    </div>
  );
}