"use client";

/**
 * Initializes Bootstrap JS (e.g. tooltips). Note: Run once so that
 * elements with data-bs-toggle="tooltip" get tooltip behavior.
 */

import { useEffect } from "react";

declare global {
  interface Window {
    bootstrap?: {
      Tooltip: new (el: Element, opts?: object) => { dispose: () => void };
    };
  }
}

export function BootstrapInit() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then(() => {
      document.querySelectorAll("[data-bs-toggle='tooltip']").forEach((el) => {
        if (window.bootstrap?.Tooltip) {
          new window.bootstrap.Tooltip(el);
        }
      });
    });
  }, []);
  return null;
}
