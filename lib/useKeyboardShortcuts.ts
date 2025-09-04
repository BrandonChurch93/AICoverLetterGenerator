import { useEffect, useCallback } from "react";

interface KeyboardShortcuts {
  "cmd+enter": () => void; // Generate cover letter
  "cmd+shift+c": () => void; // Copy to clipboard
  "cmd+e": () => void; // Edit mode
  "cmd+s": () => void; // Save edit
  escape: () => void; // Cancel edit
  "cmd+shift+p": () => void; // Export PDF
  "cmd+shift+w": () => void; // Export Word
  "cmd+r": () => void; // Regenerate
  "cmd+shift+delete": () => void; // Clear all
}

export function useKeyboardShortcuts(shortcuts: Partial<KeyboardShortcuts>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Generate: Cmd/Ctrl + Enter
      if (modifier && e.key === "Enter" && shortcuts["cmd+enter"]) {
        e.preventDefault();
        shortcuts["cmd+enter"]();
        return;
      }

      // Copy: Cmd/Ctrl + Shift + C
      if (
        modifier &&
        e.shiftKey &&
        e.key.toLowerCase() === "c" &&
        shortcuts["cmd+shift+c"]
      ) {
        e.preventDefault();
        shortcuts["cmd+shift+c"]();
        return;
      }

      // Edit: Cmd/Ctrl + E
      if (
        modifier &&
        !e.shiftKey &&
        e.key.toLowerCase() === "e" &&
        shortcuts["cmd+e"]
      ) {
        e.preventDefault();
        shortcuts["cmd+e"]();
        return;
      }

      // Save: Cmd/Ctrl + S
      if (
        modifier &&
        !e.shiftKey &&
        e.key.toLowerCase() === "s" &&
        shortcuts["cmd+s"]
      ) {
        e.preventDefault();
        shortcuts["cmd+s"]();
        return;
      }

      // Cancel: Escape
      if (e.key === "Escape" && shortcuts["escape"]) {
        e.preventDefault();
        shortcuts["escape"]();
        return;
      }

      // Export PDF: Cmd/Ctrl + Shift + P
      if (
        modifier &&
        e.shiftKey &&
        e.key.toLowerCase() === "p" &&
        shortcuts["cmd+shift+p"]
      ) {
        e.preventDefault();
        shortcuts["cmd+shift+p"]();
        return;
      }

      // Export Word: Cmd/Ctrl + Shift + W
      if (
        modifier &&
        e.shiftKey &&
        e.key.toLowerCase() === "w" &&
        shortcuts["cmd+shift+w"]
      ) {
        e.preventDefault();
        shortcuts["cmd+shift+w"]();
        return;
      }

      // Regenerate: Cmd/Ctrl + R
      if (
        modifier &&
        !e.shiftKey &&
        e.key.toLowerCase() === "r" &&
        shortcuts["cmd+r"]
      ) {
        e.preventDefault();
        shortcuts["cmd+r"]();
        return;
      }

      // Clear All: Cmd/Ctrl + Shift + Delete
      if (
        modifier &&
        e.shiftKey &&
        e.key === "Delete" &&
        shortcuts["cmd+shift+delete"]
      ) {
        e.preventDefault();
        shortcuts["cmd+shift+delete"]();
        return;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Helper to get keyboard shortcut labels for UI
export function getShortcutLabel(shortcut: string): string {
  // Use a unified format that works for both platforms
  // This avoids hydration issues with SSR
  const shortcuts: Record<string, string> = {
    "cmd+enter": "Ctrl/⌘ + Enter",
    "cmd+shift+c": "Ctrl/⌘ + Shift + C",
    "cmd+e": "Ctrl/⌘ + E",
    "cmd+s": "Ctrl/⌘ + S",
    escape: "Esc",
    "cmd+shift+p": "Ctrl/⌘ + Shift + P",
    "cmd+shift+w": "Ctrl/⌘ + Shift + W",
    "cmd+r": "Ctrl/⌘ + R",
    "cmd+shift+delete": "Ctrl/⌘ + Shift + Del",
  };

  return shortcuts[shortcut] || "";
}
