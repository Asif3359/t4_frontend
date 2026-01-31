"use client";

/**
 * Login form. Non-authenticated users only. On success redirect to /users.
 */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusMessage } from "@/components/StatusMessage";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    variant: "success" | "danger";
  } | null>(null);

  // useId() is stable between server and client — avoids hydration mismatch (Math.random is not).
  const emailId = useId();
  const passwordId = useId();

  // Redirect only in an effect so we don't update Router during render.
  useEffect(() => {
    if (user) router.replace("/users");
  }, [user, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password) {
        setStatus({
          message: "Email and password are required.",
          variant: "danger",
        });
        return;
      }
      setLoading(true);
      setStatus(null);
      try {
        const res = await api.login(email.trim(), password);
        if (res.token && res.user) {
          login(res.token, res.user);
          router.push("/users");
          return;
        }
        // Unauthorized or wrong credentials: keep error status visible until user dismisses or retries.
        setStatus({ message: res.error || "Login failed.", variant: "danger" });
      } catch (err) {
        setStatus({
          message: err instanceof Error ? err.message : "Login failed.",
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, router],
  );

  if (user) return null;

  return (
    <div className="container py-5">
      <nav className="navbar navbar-light mb-4">
        <div className="container-fluid">
          <span
            className="navbar-brand mb-0"
            title="User Management"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
          >
            User Management
          </span>
          <Link
            className="btn btn-outline-primary btn-sm"
            href="/register"
            title="Create a new account"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
          >
            Register
          </Link>
        </div>
      </nav>

      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <h2 className="mb-4">Login</h2>
          {status && (
            <StatusMessage
              message={status.message}
              variant={status.variant}
              onDismiss={() => setStatus(null)}
            />
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor={emailId} className="form-label">
                Email
              </label>
              <input
                id={emailId}
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                title="Enter your email address"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                suppressHydrationWarning
              />
            </div>
            <div className="mb-3">
              <label htmlFor={passwordId} className="form-label">
                Password
              </label>
              <input
                id={passwordId}
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••"
                autoComplete="current-password"
                title="Enter your password"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                suppressHydrationWarning
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
              title="Sign in"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>
          <p className="mt-3 text-muted small">
            Users can login and manage other users even if their e-mails are
            unverified.
          </p>
        </div>
      </div>
    </div>
  );
}
