import { useEffect, useRef } from "react";

/**
 * Announce messages to screen readers
 * Creates a live region that announces messages without visual interruption
 */
export function useAnnouncement() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement("div");
      announcer.setAttribute("role", "status");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only"; // Screen reader only
      announcer.style.position = "absolute";
      announcer.style.left = "-10000px";
      announcer.style.width = "1px";
      announcer.style.height = "1px";
      announcer.style.overflow = "hidden";
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      // Cleanup
      if (
        announcerRef.current &&
        document.body.contains(announcerRef.current)
      ) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = (
    message: string,
    priority: "polite" | "assertive" = "polite"
  ) => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute("aria-live", priority);
      announcerRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = "";
        }
      }, 1000);
    }
  };

  return announce;
}

/**
 * Focus management hook
 * Helps manage focus for keyboard navigation and accessibility
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  };

  const focusElement = (element: HTMLElement | null) => {
    if (element && element.focus) {
      element.focus();
    }
  };

  const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    containerRef.current.addEventListener("keydown", handleKeyDown);

    return () => {
      containerRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  };

  return { saveFocus, restoreFocus, focusElement, trapFocus };
}

/**
 * Reduced motion preference hook
 * Respects user's motion preferences for animations
 */
export function usePrefersReducedMotion() {
  const QUERY = "(prefers-reduced-motion: no-preference)";
  const mediaQueryList =
    typeof window !== "undefined" ? window.matchMedia(QUERY) : null;
  const prefersReducedMotion = !mediaQueryList?.matches;

  return prefersReducedMotion;
}

/**
 * ARIA labels for common UI patterns
 */
export const ariaLabels = {
  // Form labels
  resumeInput: "Enter your resume text",
  jobDescriptionInput: "Enter the job description",
  skillsInput: "Enter key skills (optional)",
  achievementsInput: "Enter notable achievements (optional)",
  preferencesInput: "Enter style preferences (optional)",

  // Button labels
  generateButton: "Generate cover letter",
  copyButton: "Copy cover letter to clipboard",
  editButton: "Edit cover letter",
  saveButton: "Save edited cover letter",
  cancelButton: "Cancel editing",
  regenerateButton: "Generate a new cover letter",
  clearAllButton: "Clear all data",
  exportPDFButton: "Export cover letter as PDF",
  exportWordButton: "Export cover letter as Word document",
  exportTextButton: "Export cover letter as text file",

  // Status messages
  generatingStatus: "Generating your cover letter",
  generatedStatus: "Cover letter generated successfully",
  copiedStatus: "Cover letter copied to clipboard",
  savedStatus: "Changes saved",
  exportedStatus: "Cover letter exported successfully",
  errorStatus: "An error occurred. Please try again.",

  // Navigation
  stepIndicator: "Progress: Step {current} of {total}",
  expandSection: "Expand {section} section",
  collapseSection: "Collapse {section} section",
};

/**
 * Get appropriate ARIA role for different UI elements
 */
export function getAriaRole(elementType: string): string {
  const roles: Record<string, string> = {
    "primary-navigation": "navigation",
    "step-indicator": "progressbar",
    "alert-success": "status",
    "alert-error": "alert",
    modal: "dialog",
    dropdown: "menu",
    "tab-list": "tablist",
    tab: "tab",
    "tab-panel": "tabpanel",
  };

  return roles[elementType] || "";
}
