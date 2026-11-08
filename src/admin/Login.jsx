import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInAdmin(email.trim(), password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-soft-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-navy/60">Admin Access</div>
          <h1 className="mt-1 text-2xl font-bold text-navy">Sign in</h1>
          <p className="mt-2 text-sm text-navy/70">
            Only the approved administrator may access this panel.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm outline-none focus:border-royal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm outline-none focus:border-royal"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-royal disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-navy/50">
          No registration. Contact the site owner if you need access.
        </p>
      </div>
    </div>
  );
}