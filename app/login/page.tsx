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
import Image from "next/image";

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

  const emailId = useId();
  const passwordId = useId();
  const [remember, setRemember] = useState(false);

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
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-light bg-light border-bottom">
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

      <main className="flex-grow-1 d-flex justify-content-center align-items-center py-4 px-2 px-sm-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-10 col-lg-8 col-xl-6 mx-auto">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-4 p-sm-5">
                  <h2 className="mb-4 text-center">Login</h2>
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
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          id="remember"
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={remember}
                          onChange={() => setRemember(!remember)}
                          title="Remember me"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                        />
                        <label className="form-check-label" htmlFor="remember">
                          Remember me
                        </label>
                      </div>
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
                  <div className="mt-4 pt-2 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-center text-sm-start">
                    <p className="mb-0 text-muted small">
                      No account?{" "}
                      <Link
                        href="/register"
                        className="text-primary"
                        title="Create account"
                        data-bs-toggle="tooltip"
                      >
                        Register here
                      </Link>
                    </p>
                    <Link
                      href="/"
                      className="text-muted small"
                      title="Forgot password?"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                    >
                      Forgot password{" "}
                      <i className="bi bi-question-circle" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-11 col-md-10 col-lg-4 col-xl-4 mx-auto mt-4 mt-lg-0 d-flex justify-content-center align-items-center d-none d-lg-flex">
              <Image
                src="/login.png"
                alt="Login"
                width={400}
                height={400}
                className="img-fluid rounded"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
