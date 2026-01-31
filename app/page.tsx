"use client";

/**
 * Home: redirect authenticated users to /users; others to /login.
 * Non-authenticated users have access only to login or registration form.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/users");
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

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
          <div className="d-flex gap-2">
            <Link
              className="btn btn-outline-primary btn-sm"
              href="/login"
              title="Sign in"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
            >
              Login
            </Link>
            <Link
              className="btn btn-primary btn-sm"
              href="/register"
              title="Create account"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
      <p className="text-muted">Redirecting…</p>
    </div>
  );
}
