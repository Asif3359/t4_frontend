"use client";

/**
 * In-page status message (success or error). Important: No browser alerts.
 */

import React from "react";

type Variant = "success" | "danger" | "info";

export function StatusMessage({
  message,
  variant = "info",
  onDismiss,
}: {
  message: string | null;
  variant?: Variant;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <div
      className={`alert alert-${variant} alert-dismissible fade show`}
      role="alert"
    >
      {message}
      {onDismiss && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          title="Dismiss"
          data-bs-toggle="tooltip"
          data-bs-placement="left"
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
