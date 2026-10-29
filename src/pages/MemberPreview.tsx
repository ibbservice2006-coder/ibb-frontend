import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, CalendarDays, Car, ChevronDown, Globe2, HeartPulse, LayoutDashboard, LifeBuoy, LockKeyhole, LogOut, Menu, Plane, Settings2, ShieldCheck, UserRound, Wallet, X } from "lucide-react";
import logo from "@/assets/logoIBBservice.png";
import AccountPages from "@/components/member-preview/AccountPages";
import ShuttlePages from "@/components/member-preview/ShuttlePages";
import { copyFor, memberUrl, PageHeading, Panel, PreviewDialog, PreviewNote, Status, tierDescription } from "@/components/member-preview/ui";
import type { MemberPageProps, MemberTier, PreviewLanguage, PreviewProfile } from "@/components/member-preview/ui";
import "@/components/member-preview/member-preview.css";

const initialProfile: PreviewProfile = { name: "Alex Morgan", email: "alex@example.com", phone: "+66 80 000 0000", country: "Thailand" };

export default function MemberPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<PreviewLanguage>("en");
  const [tier, setTier] = useState<MemberTier>("VIP");
  const [profile, setProfile] = useState(initialProfile);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState<"signout" | "help" | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const c = copyFor(language);
  const page = location.pathname.replace(/^\/member-preview\/?/, "").replace(/\/$/, "") || "overview";
  const isShuttle = page.startsWith("shuttle/");
  const knownAccountPages = ["profile", "security", "preferences", "membership", "services"];
  useEffect(() => { setMobileMenu(false); window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(""), 5000); return () => window.clearTimeout(timer); }, [message]);

  const accountNav = [
    { path: "overview", icon: LayoutDashboard, title: c("Overview", "ภาพรวมบัญชี") },
    { path: "profile", icon: UserRound, title: c("Personal information", "ข้อมูลส่วนตัว") },
    { path: "security", icon: LockKeyhole, title: c("Login & security", "การเข้าสู่ระบบและความปลอดภัย") },
    { path: "preferences", icon: Settings2, title: c("Preferences", "การตั้งค่า") },
    { path: "membership", icon: ShieldCheck, title: c("Membership", "สมาชิกและสิทธิ์") },
    { path: "services", icon: Globe2, title: c("IBB services", "บริการของ IBB") },
  ];
  const shuttleNav = [
    { path: "shuttle/bookings", icon: CalendarDays, title: c("My bookings", "การจองของฉัน") },
    { path: "shuttle/balance", icon: Wallet, title: c("Advance balance", "ยอดฝากล่วงหน้า") },
    ...(tier === "Business Partner" ? [{ path: "shuttle/reports", icon: Building2, title: c("Organization reports", "รายงานองค์กร") }] : []),
  ];
  const props: MemberPageProps = { page, language, tier, profile, onProfileChange: setProfile, onLanguageChange: setLanguage, notify: setMessage };
  const navigation = (items: typeof accountNav) => items.map(({ path, icon: Icon, title }) => <NavLink key={path} to={memberUrl(path)} className={({ isActive }) => `mp-nav-link ${isActive || (path === "shuttle/bookings" && page.startsWith("shuttle/booking/")) ? "mp-nav-active" : ""}`}><Icon size={18} aria-hidden="true"/><span>{title}</span>{path === "overview" && <span className="mp-nav-dot"/>}</NavLink>);

  if (!signedIn) return <div className="member-preview mp-signed-out"><div><img src={logo} alt="IBB Service" width={60} height={60}/><PageHeading eyebrow="IBB ACCOUNT" title={c("Signed out of the preview", "ออกจากตัวอย่างหน้าบัญชีแล้ว")} description={c("This was a simulated session. Your real account has not been signed out.", "นี่เป็นการจำลอง ไม่ได้ออกจากบัญชีจริงของคุณ")}/><button className="mp-button" onClick={() => { setSignedIn(true); navigate(memberUrl("overview")); }}>{c("Return to account preview", "กลับไปตัวอย่างหน้าบัญชี")}<ArrowRight size={16}/></button></div></div>;

  return <div className="member-preview">
    <a className="mp-skip" href="#member-main">{c("Skip to content", "ข้ามไปเนื้อหา")}</a>
    <header className="mp-topbar">
      <div className="mp-brand"><button className="mp-icon-button mp-mobile-toggle" aria-label={c("Open account menu", "เปิดเมนูบัญชี")} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={22}/> : <Menu size={22}/>}</button><Link to={memberUrl("overview")} className="mp-brand-link"><img src={logo} alt="IBB Service" width={42} height={42}/><span><strong className="font-heading">IBB</strong><span className="mp-brand-caption">{c("My Account", "บัญชีของฉัน")}</span></span></Link></div>
      <div className="mp-top-actions"><Link to={memberUrl("shuttle/bookings")} className="mp-context-link"><Car size={17}/><span>{c("Shuttle Service", "บริการ Shuttle")}</span><ArrowUpRight size={15}/></Link><span className="mp-top-divider"/><button className="mp-language-button" aria-label={c("Switch to Thai", "เปลี่ยนเป็นภาษาอังกฤษ")} onClick={() => setLanguage(language === "en" ? "th" : "en")}><Globe2 size={16}/>{language.toUpperCase()}<ChevronDown size={13}/></button><Link className="mp-avatar" to={memberUrl("profile")} aria-label={c("Personal information", "ข้อมูลส่วนตัว")}>{profile.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</Link></div>
    </header>
    <div className="mp-workspace">
      {mobileMenu && <button className="mp-mobile-scrim" aria-label={c("Close menu", "ปิดเมนู")} onClick={() => setMobileMenu(false)}/>}
      <aside className={`mp-sidebar ${mobileMenu ? "mp-sidebar-open" : ""}`} aria-label={c("Account navigation", "เมนูบัญชี")}>
        <div className="mp-sidebar-member"><span className="mp-member-initial">{profile.name.charAt(0)}</span><div><strong>{profile.name}</strong><span>{c("One IBB account", "บัญชี IBB เดียว")}</span></div></div>
        <nav aria-label={c("Central account", "บัญชีกลาง")}><p className="mp-nav-label">{c("YOUR ACCOUNT", "บัญชีกลางของคุณ")}</p>{navigation(accountNav)}</nav>
        <nav aria-label={c("Shuttle Service", "บริการ Shuttle")} className="mp-service-nav"><p className="mp-nav-label">{c("SHUTTLE SERVICE", "บริการ SHUTTLE")}</p>{navigation(shuttleNav)}</nav>
        <div className="mp-sidebar-bottom"><button className="mp-nav-link" onClick={() => setDialog("help")}><LifeBuoy size={18}/><span>{c("Help & support", "ความช่วยเหลือ")}</span></button><button className="mp-nav-link" onClick={() => setDialog("signout")}><LogOut size={18}/><span>{c("Sign out", "ออกจากระบบ")}</span></button><div className="mp-preview-controls"><label htmlFor="mp-preview-tier">{c("Example member level", "ระดับสมาชิกตัวอย่าง")}</label><select id="mp-preview-tier" value={tier} onChange={e => setTier(e.target.value as MemberTier)}>{["General", "VIP", "VVIP", "Business Partner"].map(value => <option key={value}>{value}</option>)}</select><p>{c("For preview only. Does not change a real membership.", "ใช้ทดลอง UI เท่านั้น ไม่เปลี่ยนระดับสมาชิกจริง")}</p></div></div>
      </aside>
      <main id="member-main" className="mp-main">
        <div className="mp-breadcrumb"><span>IBB</span><span>/</span><span>{isShuttle ? c("Shuttle Service", "บริการ Shuttle") : c("My Account", "บัญชีของฉัน")}</span><span className="mp-preview-tag">{c("DESIGN PREVIEW", "ตัวอย่างดีไซน์")}</span></div>
        {page === "overview" ? <>
          <PageHeading eyebrow={c("YOUR PERSONAL SPACE", "พื้นที่ส่วนตัวของคุณ")} title={c(`Good to see you, ${profile.name.split(" ")[0]}.`, `ยินดีต้อนรับ ${profile.name.split(" ")[0]}`)} description={c("One account for your IBB services. Your details stay together; each service has its own space.", "บัญชีเดียวสำหรับบริการ IBB จัดการข้อมูลส่วนตัวในที่เดียว และแยกพื้นที่ของแต่ละบริการ")}/>
          <div className="mp-overview-layout">
            <section className="mp-overview-services"><div className="mp-section-heading"><h2 className="text-xl font-semibold">{c("Your services", "บริการของคุณ")}</h2><Link to={memberUrl("services")} className="mp-text-link">{c("View services", "ดูบริการ")}<ArrowRight size={15}/></Link></div>
              <div className="mp-primary-service"><div className="mp-primary-service-top"><span className="mp-service-emblem"><Car size={26}/></span><Status>{c("Available", "เปิดให้บริการ")}</Status></div><p className="mp-eyebrow">IBB SHUTTLE SERVICE</p><h2 className="text-2xl font-semibold">{c("Your journey, thoughtfully arranged.", "ดูแลทุกการเดินทางอย่างใส่ใจ")}</h2><p>{c("Private Car, Van and Bus bookings, arranged by our team. Manage your trips here.", "จอง Car, Van และ Bus แบบเหมาคัน โดยทีมงานเป็นผู้จัดรถ ดูและจัดการการเดินทางที่นี่")}</p><div className="mp-primary-service-footer"><div><span className="mp-small-label">{c("SHUTTLE MEMBERSHIP", "สมาชิก SHUTTLE")}</span><strong>{tier}</strong></div><Link className="mp-button" to={memberUrl("shuttle/bookings")}>{c("Open Shuttle", "เข้าสู่ Shuttle")}<ArrowRight size={17}/></Link></div></div>
              <div className="mp-future-service"><span className="mp-icon-tile"><Plane size={22}/></span><div><h3 className="font-semibold">IBB Travel</h3><p>{c("A separate space for travel services.", "พื้นที่เฉพาะสำหรับบริการท่องเที่ยว")}</p></div><Status tone="muted">{c("Coming soon", "ยังไม่เปิดบริการ")}</Status></div>
              <div className="mp-future-service"><span className="mp-icon-tile"><HeartPulse size={22}/></span><div><h3 className="font-semibold">IBB Health</h3><p>{c("A separate space for health services.", "พื้นที่เฉพาะสำหรับบริการด้านสุขภาพ")}</p></div><Status tone="muted">{c("Coming soon", "ยังไม่เปิดบริการ")}</Status></div>
            </section>
            <aside className="mp-account-summary"><Panel title={c("Your account, together", "ข้อมูลบัญชีในที่เดียว")} description={c("Shared across IBB services", "ข้อมูลกลางสำหรับทุกบริการ IBB")}><div className="mp-summary-person"><span className="mp-avatar">{profile.name.charAt(0)}</span><div><strong>{profile.name}</strong><p>{profile.email}</p></div></div><Link className="mp-summary-link" to={memberUrl("profile")}><span><UserRound size={17}/>{c("Personal information", "ข้อมูลส่วนตัว")}</span><ArrowUpRight size={17}/></Link><Link className="mp-summary-link" to={memberUrl("security")}><span><LockKeyhole size={17}/>{c("Login & security", "ความปลอดภัย")}</span><ArrowUpRight size={17}/></Link><Link className="mp-summary-link" to={memberUrl("preferences")}><span><Settings2 size={17}/>{c("Preferences", "การตั้งค่า")}</span><ArrowUpRight size={17}/></Link></Panel><div className="mp-membership-summary"><div className="mp-membership-icon"><ShieldCheck size={23}/></div><p className="mp-small-label">{c("YOUR SHUTTLE LEVEL", "ระดับ SHUTTLE ของคุณ")}</p><h3 className="text-xl font-semibold">{tier}</h3><p>{tierDescription(tier, language)}</p><Link className="mp-text-link" to={memberUrl("membership")}>{c("View membership", "ดูสิทธิ์สมาชิก")}<ArrowRight size={15}/></Link></div></aside>
          </div>
          <PreviewNote>{c("Example account and data only. No real sign-in, booking, payment or account update is performed.", "บัญชีและข้อมูลตัวอย่างเท่านั้น ไม่เข้าสู่ระบบ จอง ชำระเงิน หรือแก้ข้อมูลบัญชีจริง")}</PreviewNote>
        </> : knownAccountPages.includes(page) ? <AccountPages {...props}/> : isShuttle ? <ShuttlePages {...props}/> : <Navigate to={memberUrl("overview")} replace/>}
        <footer className="mp-footer"><span>© 2026 IBB Service</span><Link to="/en/shuttle"><ArrowLeft size={14}/>{c("Back to Shuttle website", "กลับเว็บไซต์ Shuttle")}</Link><span>{c("Example data · No live transactions", "ข้อมูลตัวอย่าง · ไม่มีธุรกรรมจริง")}</span></footer>
      </main>
    </div>
    {message && <div className="mp-feedback" role="status">{message}<button aria-label={c("Dismiss", "ปิดข้อความ")} onClick={() => setMessage("")}><X size={16}/></button></div>}
    {dialog === "signout" && <PreviewDialog title={c("Sign out of this preview?", "ออกจากตัวอย่างหน้าบัญชี?")} description={c("This only changes the demo screen. It does not affect any real IBB session.", "เปลี่ยนเฉพาะหน้าจอตัวอย่าง ไม่กระทบบัญชีหรือการเข้าสู่ระบบ IBB จริง")} onClose={() => setDialog(null)}><div className="mp-actions"><button className="mp-button mp-button-secondary" onClick={() => setDialog(null)}>{c("Stay signed in", "อยู่ในหน้าตัวอย่าง")}</button><button className="mp-button" onClick={() => { setDialog(null); setSignedIn(false); }}>{c("Sign out of preview", "ออกจากตัวอย่าง")}</button></div></PreviewDialog>}
    {dialog === "help" && <PreviewDialog title={c("How can we help?", "ให้เราช่วยเรื่องใด?")} description={c("Preview the support form. No message will be sent.", "ทดลองแบบฟอร์มช่วยเหลือ ไม่มีการส่งข้อความจริง")} onClose={() => setDialog(null)}><form onSubmit={e => { e.preventDefault(); setDialog(null); setMessage(c("Example support request shown. No message was sent.", "ทดลองคำขอช่วยเหลือแล้ว ไม่มีการส่งข้อความจริง")); }}><label className="mp-field">{c("Your question", "คำถามของคุณ")}<textarea required rows={4} placeholder={c("Tell us what you need help with…", "ระบุเรื่องที่ต้องการความช่วยเหลือ…")}/></label><div className="mp-actions"><button className="mp-button" type="submit">{c("Preview request", "ทดลองคำขอ")}</button></div></form></PreviewDialog>}
  </div>;
}
