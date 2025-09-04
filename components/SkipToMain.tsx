import React from "react";

/**
 * Skip to main content link component
 * Allows keyboard users to skip repetitive navigation
 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
