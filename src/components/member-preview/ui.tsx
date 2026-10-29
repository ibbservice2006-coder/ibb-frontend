import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Info, X } from "lucide-react";
import type { Language } from "@/contexts/LanguageContext";

export type PreviewLanguage = Language;
export type MemberTier = "General" | "VIP" | "VVIP" | "Business Partner";
export interface PreviewProfile { name: string; email: string; phone: string; country: string; }
export interface MemberPageProps {
  page: string;
  language: PreviewLanguage;
  tier: MemberTier;
  accountKey: string;
  profile: PreviewProfile;
  onProfileChange: (profile: PreviewProfile) => void;
  onLanguageChange: (language: PreviewLanguage) => void;
  notify: (message: string) => void;
}
export const memberUrl = (path: string) => {
  const accountPages = ["profile", "security", "preferences"];
  const scopedPath = accountPages.includes(path) ? `account/${path}` : path === "membership" ? "shuttle/membership" : ["overview", "services"].includes(path) ? "shuttle/overview" : path;
  return `/member-preview/${scopedPath}?from=shuttle`;
};
export const copyFor = (language: PreviewLanguage) => (en: string, th: string) => language === "th" ? th : en;
export const money = (amount: number, currency = "THB") => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="mp-page-heading"><div><p className="mp-eyebrow">{eyebrow}</p><h1 className="text-3xl font-bold">{title}</h1><p className="mp-description">{description}</p></div>{action}</header>;
}
export function Panel({ title, description, children, className = "", action }: { title?: string; description?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return <section className={`mp-panel ${className}`}>{title && <div className="mp-panel-heading"><div><h2 className="text-lg font-semibold">{title}</h2>{description && <p>{description}</p>}</div>{action}</div>}{children}</section>;
}
export function PreviewNote({ children }: { children: ReactNode }) {
  return <div className="mp-note"><Info size={16} aria-hidden="true"/><p>{children}</p></div>;
}
export function Status({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "muted" }) {
  return <span className={`mp-status mp-status-${tone}`}>{children}</span>;
}
export function LinkButton({ to, children, secondary = false }: { to: string; children: ReactNode; secondary?: boolean }) {
  return <Link className={`mp-button ${secondary ? "mp-button-secondary" : ""}`} to={memberUrl(to)}>{children}<ArrowUpRight size={16} aria-hidden="true"/></Link>;
}
export function PreviewDialog({ title, description, children, onClose }: { title: string; description: string; children: ReactNode; onClose: () => void }) {
  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="member-preview mp-dialog-overlay"/><Dialog.Content className="member-preview mp-dialog"><div className="mp-dialog-heading"><Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title><Dialog.Close className="mp-icon-button" aria-label="Close dialog"><X size={20}/></Dialog.Close></div><Dialog.Description className="mp-description">{description}</Dialog.Description>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="mp-empty"><h3 className="text-lg font-semibold">{title}</h3><p>{description}</p>{children}</div>;
}
export const tierDescription = (tier: MemberTier, language: PreviewLanguage) => {
  const c = copyFor(language);
  if (tier === "General") return c("Use Shuttle without registering. THB payments.", "ใช้ Shuttle ได้โดยไม่ต้องสมัคร ชำระเป็น THB");
  if (tier === "VIP") return c("Advance deposits with THB, USD, EUR, GBP, JPY and CNY.", "ฝากเงินล่วงหน้า รองรับ THB, USD, EUR, GBP, JPY และ CNY");
  if (tier === "VVIP") return c("Multi-currency payments and Crypto: USDT, BTC, ETH and BNB.", "ชำระหลายสกุลเงินและ Crypto: USDT, BTC, ETH และ BNB");
  return c("For companies and organizations, with reports and all payment channels.", "สำหรับบริษัทและองค์กร มีรายงานและรองรับทุกช่องทางชำระเงิน");
};
