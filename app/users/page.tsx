"use client";

/**
 * User management (admin panel). Only authenticated non-blocked users.
 * Table: checkbox, name, email, last login time, status.
 * Toolbar: Block (text), Unblock (icon), Delete (icon), Delete unverified (icon).
 * Important: No buttons in data rows; selection and toolbar only.
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusMessage } from "@/components/StatusMessage";

/** Note: Last login comes from API; we display "—" when null or empty. */
function formatLastLogin(value: string | null): string {
  if (value == null || value === "") return "—";
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  } catch {
    return value;
  }
}

export default function UsersPage() {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<{
    message: string;
    variant: "success" | "danger";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.getUsers(token);
      if (res.users) setUsers(res.users);
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : "Failed to load users.",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadUsers();
  }, [token, loadUsers]);

  // Nota bene: Re-initialize Bootstrap tooltips when table content changes.
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !(
        window as unknown as {
          bootstrap?: { Tooltip: new (el: Element) => void };
        }
      ).bootstrap
    )
      return;
    const bt = (
      window as unknown as {
        bootstrap?: { Tooltip: new (el: Element) => void };
      }
    ).bootstrap;
    if (!bt?.Tooltip) return;
    document.querySelectorAll("[data-bs-toggle='tooltip']").forEach((el) => {
      try {
        new bt.Tooltip(el);
      } catch {
        // already initialized
      }
    });
  }, [users, selectedIds]);

  const allSelected = useMemo(() => {
    if (users.length === 0) return false;
    return users.every((u) => selectedIds.has(u.id));
  }, [users, selectedIds]);

  const someSelected = selectedIds.size > 0;
  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);

  // useId() is stable between server and client — avoids hydration mismatch.
  const headerCheckId = useId();
  const headerCheckRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = headerCheckRef.current;
    if (!el) return;
    el.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  }, [allSelected, users]);

  const toggleOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Nota bene: Single helper for block/unblock/delete so status and refresh are consistent. */
  const runAction = useCallback(
    async (
      fn: () => Promise<unknown>,
      successMessage: string,
      errMessage: string,
    ) => {
      if (!token) return;
      setActionLoading(true);
      setStatus(null);
      try {
        await fn();
        setStatus({ message: successMessage, variant: "success" });
        setSelectedIds(new Set());
        await loadUsers();
      } catch (err) {
        setStatus({
          message: err instanceof Error ? err.message : errMessage,
          variant: "danger",
        });
      } finally {
        setActionLoading(false);
      }
    },
    [token, loadUsers],
  );

  const onBlock = useCallback(() => {
    if (selectedList.length === 0) return;
    runAction(
      () => api.blockUsers(token!, selectedList),
      "Users blocked.",
      "Failed to block users.",
    );
  }, [token, selectedList, runAction]);

  const onUnblock = useCallback(() => {
    if (selectedList.length === 0) return;
    runAction(
      () => api.unblockUsers(token!, selectedList),
      "Users unblocked.",
      "Failed to unblock users.",
    );
  }, [token, selectedList, runAction]);

  const onDelete = useCallback(() => {
    if (selectedList.length === 0) return;
    runAction(
      () => api.deleteUsers(token!, selectedList),
      "Users deleted.",
      "Failed to delete users.",
    );
  }, [token, selectedList, runAction]);

  const onDeleteUnverified = useCallback(() => {
    runAction(
      () =>
        api.deleteUnverified(
          token!,
          selectedList.length > 0 ? selectedList : undefined,
        ),
      "Unverified users deleted.",
      "Failed to delete unverified users.",
    );
  }, [token, selectedList, runAction]);

  useEffect(() => {
    if (user) return;
    if (typeof window === "undefined") return;
    const id = setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    return () => clearTimeout(id);
  }, [user]);

  if (!user) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3">
        <div className="text-center">
          <p className="text-danger mb-3">Access denied. Please log in.</p>
          <Link
            href="/login"
            className="btn btn-primary"
            title="Open login page"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column ">
      <nav className="navbar navbar-expand-sm navbar-light bg-light border-bottom flex-shrink-0">
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
          <div className="navbar-nav ms-auto flex-nowrap align-items-center">
            <span
              className="navbar-text me-2 d-none d-sm-inline text-truncate"
              style={{ maxWidth: "min(180px, 45vw)" }}
              title={user.email}
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
            >
              {user.email}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={logout}
              title="Sign out"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1 py-3 py-sm-4 px-2 px-sm-3 overflow-auto container">
        <div className="container-fluid px-0 px-sm-2">
          <h2 className="mb-3 fs-5 fs-md-4">Users</h2>

          {status && (
            <StatusMessage
              message={status.message}
              variant={status.variant}
              onDismiss={() => setStatus(null)}
            />
          )}

          {/* Toolbar over table: Block (text), Unblock (icon), Delete (icon), Delete unverified (icon). */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2 p-2 border rounded bg-light">
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={onBlock}
              disabled={!someSelected || actionLoading}
              title="Block selected users"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
            >
              Block
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onUnblock}
              disabled={!someSelected || actionLoading}
              title="Unblock selected users"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              aria-label="Unblock selected users"
            >
              <i className="bi bi-unlock" aria-hidden />
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onDelete}
              disabled={!someSelected || actionLoading}
              title="Permanently delete selected users"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              aria-label="Delete selected users"
            >
              <i className="bi bi-trash" aria-hidden />
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onDeleteUnverified}
              disabled={actionLoading}
              title="Delete unverified users (selected only if any, otherwise all unverified)"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              aria-label="Delete unverified users"
            >
              <i className="bi bi-person-x" aria-hidden />
            </button>
          </div>

          <div className="table-responsive overflow-x-auto">
            <table
              className="table table-bordered table-hover align-middle table-sm mb-0"
              style={{ minWidth: "520px" }}
            >
              <thead className="table-light">
                <tr>
                  <th
                    className="text-center text-nowrap"
                    style={{ width: "2.5rem" }}
                  >
                    <input
                      id={headerCheckId}
                      ref={headerCheckRef}
                      type="checkbox"
                      className="form-check-input"
                      checked={users.length > 0 && allSelected}
                      onChange={toggleAll}
                      aria-label="Select all or deselect all"
                      title="Select all / Deselect all"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                    />
                  </th>
                  <th
                    className="text-nowrap"
                    title="User full name"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    Name
                  </th>
                  <th
                    className="text-nowrap"
                    title="User email address"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    E-mail
                  </th>
                  <th
                    className="text-nowrap"
                    title="unverified / active / blocked"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    Status
                  </th>
                  <th
                    className="text-nowrap"
                    title="Time of last sign-in"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    Last login time
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Loading…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No users.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="text-center">
                        <input
                          id={`row-check-${u.id}`}
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.has(u.id)}
                          onChange={() => toggleOne(u.id)}
                          aria-label={`Select ${u.name}`}
                          title={`Select ${u.name}`}
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                        />
                      </td>
                      <td className="text-break">{u.name}</td>
                      <td className="text-break">{u.email}</td>
                      <td className="text-nowrap">{u.status}</td>
                      <td className="text-nowrap small">
                        {formatLastLogin(u.last_login)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
