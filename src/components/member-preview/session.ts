import type { MemberTier, PreviewLanguage, PreviewProfile } from "./ui";

export interface MemberSession {
  accountKey: string;
  profile: PreviewProfile;
  tier: MemberTier;
  language: PreviewLanguage;
}

const sessionKey = "ibb-shuttle-ui-session";

export function accountFor(email: string, name?: string): MemberSession {
  const normalized = email.trim().toLowerCase();
  const accounts: Record<string, { name: string; tier: MemberTier }> = {
    "alex@example.com": { name: "Alex Morgan", tier: "VIP" },
    "jamie@example.com": { name: "Jamie Taylor", tier: "VVIP" },
    "general@example.com": { name: "Chris Parker", tier: "General" },
    "company@example.com": { name: "Jordan Lee", tier: "Business Partner" },
  };
  const account = accounts[normalized];
  return {
    accountKey: normalized,
    profile: {
      name: name?.trim() || account?.name || normalized.split("@")[0],
      email: normalized,
      phone: "+66 80 000 0000",
      country: "Thailand",
    },
    tier: name ? "General" : account?.tier ?? "General",
    language: "en",
  };
}

export function readMemberSession(): MemberSession | null {
  try {
    const value = sessionStorage.getItem(sessionKey);
    if (!value) return null;
    const session: MemberSession = JSON.parse(value);
    if (!session.accountKey || !session.profile?.email || !["General", "VIP", "VVIP", "Business Partner"].includes(session.tier)) return null;
    return session;
  } catch {
    return null;
  }
}

export function writeMemberSession(session: MemberSession | null) {
  const serialized = session ? JSON.stringify(session) : null;
  try {
    const previous = sessionStorage.getItem(sessionKey);
    if (serialized === null) {
      if (previous === null) return;
      sessionStorage.removeItem(sessionKey);
    } else {
      if (previous === serialized) return;
      sessionStorage.setItem(sessionKey, serialized);
    }
    if (typeof window !== "undefined") window.dispatchEvent(new Event("ibb-member-ui-session"));
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}
