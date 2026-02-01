/**
 * API client and utilities.
 * Important: All requests (except register/login) must send the JWT;
 * on 401 the client redirects to login.
 */

const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:5000";

export function getUniqIdValue(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

export type OnUnauthorized = () => void;

let onUnauthorized: OnUnauthorized = () => {
  if (typeof window !== "undefined") window.location.href = "/login";
};

export function setOnUnauthorized(fn: OnUnauthorized): void {
  onUnauthorized = fn;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string | null;
  user?: T;
  users?: T[];
  token?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  status: "unverified" | "active" | "blocked";
  last_login: string | null;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<ApiResponse<T>> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (res.status === 401) {
    if (token) onUnauthorized();
    throw new Error(data.error || data.message || "Unauthorized");
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  getBase: () => API_BASE,

  health: () => request<{ status: string; database: string }>("/health"),

  register: (name: string, email: string, password: string) =>
    request<{ id: number; name: string; email: string; status: string }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ name, email, password }) }
    ),

  login: (email: string, password: string) =>
    request<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getUsers: (token: string) =>
    request<User>("/users", { method: "GET", token }),

  blockUsers: (token: string, ids: number[]) =>
    request("/users/block", {
      method: "POST",
      body: JSON.stringify({ ids }),
      token,
    }),

  unblockUsers: (token: string, ids: number[]) =>
    request("/users/unblock", {
      method: "POST",
      body: JSON.stringify({ ids }),
      token,
    }),

  deleteUsers: (token: string, ids: number[]) =>
    request("/users/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
      token,
    }),

  deleteUnverified: (token: string, ids?: number[]) =>
    request("/users/delete-unverified", {
      method: "POST",
      body: JSON.stringify(ids ? { ids } : {}),
      token,
    }),
};
