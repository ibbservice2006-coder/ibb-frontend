import { useSyncExternalStore } from "react";
import type { MemberSession } from "./session";
import { readMemberSession } from "./session";
import { memberUrl } from "./ui";

const sessionKey = "ibb-shuttle-ui-session";
const sessionUiEvent = "ibb-member-ui-session";
const allowedReturnPaths = new Set([
  "/landing",
  "/shuttle",
  "/pricing",
  "/member-preview/shuttle/overview",
  "/member-preview/shuttle/balance",
]);
const allowedReturnLocales = ["en", "th", "zh", "ja", "ko", "ru", "ar", "de", "fr", "es", "id", "hi", "vi"];

let hasCachedRaw = false;
let cachedRaw: string | null = null;
let cachedSession: MemberSession | null = null;

function readSerializedSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(sessionKey);
  } catch {
    return null;
  }
}

function getMemberSessionSnapshot(): MemberSession | null {
  if (typeof window === "undefined") return null;
  const raw = readSerializedSession();
  if (!hasCachedRaw || raw !== cachedRaw) {
    hasCachedRaw = true;
    cachedRaw = raw;
    cachedSession = readMemberSession();
  }
  return cachedSession;
}

function getServerMemberSessionSnapshot(): null {
  return null;
}

function subscribeToMemberSession(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(sessionUiEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(sessionUiEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });
}

export function useMemberSession(): MemberSession | null {
  return useSyncExternalStore(subscribeToMemberSession, getMemberSessionSnapshot, getServerMemberSessionSnapshot);
}

export function safeMemberReturnTo(value: string | null | undefined): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048 || value.trim() !== value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || containsControlCharacter(value)) return null;

  const suffixStart = value.search(/[?#]/);
  const pathname = suffixStart === -1 ? value : value.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : value.slice(suffixStart);
  const isLocalizedShuttlePath = allowedReturnLocales.some((locale) => pathname === `/${locale}/shuttle`);

  if (!allowedReturnPaths.has(pathname) && !isLocalizedShuttlePath) return null;
  return `${pathname}${suffix}`;
}

export function memberLoginHref(returnTo?: string): string {
  const loginHref = memberUrl("login");
  const safeReturnTo = safeMemberReturnTo(returnTo);
  return safeReturnTo ? `${loginHref}&returnTo=${encodeURIComponent(safeReturnTo)}` : loginHref;
}
