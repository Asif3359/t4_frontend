"use client";

/**
 * Registration form. User is registered right away; confirmation email is sent asynchronously.
 */

import { useCallback, useId, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StatusMessage } from "@/components/StatusMessage";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    variant: "success" | "danger";
  } | null>(null);

  // useId() is stable between server and client — avoids hydration mismatch.
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      if (!trimmedName || !trimmedEmail || !password) {
        setStatus({
          message: "Name, email and password are required.",
          variant: "danger",
        });
        return;
      }
      setLoading(true);
      setStatus(null);
      try {
        const res = await api.register(trimmedName, trimmedEmail, password);
        if (res.success) {
          setStatus({
            message:
              "Registration successful. A confirmation email has been sent; clicking the link will change your status from unverified to active.",
            variant: "success",
          });
          setName("");
          setEmail("");
          setPassword("");
        } else {
          setStatus({
            message: res.error || "Registration failed.",
            variant: "danger",
          });
        }
      } catch (err) {
        setStatus({
          message: err instanceof Error ? err.message : "Registration failed.",
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    },
    [name, email, password],
  );

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-light bg-light border-bottom">
        <div className="container-fluid px-2 px-sm-3">
          <span
            className="navbar-brand mb-0 text-truncate me-2"
            style={{ maxWidth: "50vw" }}
            title="User Management"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
          >
            User Management
          </span>
          <Link
            className="btn btn-outline-primary btn-sm"
            href="/login"
            title="Sign in to your account"
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
          >
            Login
          </Link>
        </div>
      </nav>

      <main className="flex-grow-1 d-flex justify-content-center align-items-center py-4 px-2 px-sm-3">
        <div className="container w-100">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-10 col-lg-8 col-xl-6 mx-auto">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-4 p-sm-5">
                  <h2 className="mb-4 text-center">Register</h2>
                  {status && (
                    <StatusMessage
                      message={status.message}
                      variant={status.variant}
                      onDismiss={() => setStatus(null)}
                    />
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor={nameId} className="form-label">
                        Name
                      </label>
                      <input
                        id={nameId}
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                        title="Enter your full name"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                      />
                    </div>
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
                        placeholder="Any non-empty password (e.g. one character)"
                        autoComplete="new-password"
                        title="Any non-empty password is allowed"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                      title="Create account"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                    >
                      {loading ? "Registering…" : "Register"}
                    </button>
                  </form>
                  <div className="mb-3">
                    <div className="text-center mt-2">
                      If already have an account, you can{" "}
                      <Link href="/login" className="text-primary">
                        login here
                      </Link>
                    </div>
                  </div>
                  <p className="mt-3 mb-0 text-muted small text-center">
                    You can use any non-empty password (even one character).
                    After registration, check your email to verify and change
                    status to active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
