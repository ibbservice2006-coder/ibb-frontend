import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Car, LayoutDashboard, LockKeyhole, LogOut, Menu, Settings2, ShieldCheck, UserRound, Wallet, X } from "lucide-react";
import AccountPages from "@/components/member-preview/AccountPages";
import ShuttlePages from "@/components/member-preview/ShuttlePages";
import MemberSignIn from "@/components/member-preview/MemberSignIn";
import { MemberIBBHeader, MemberIBBFooter } from "@/components/member-preview/MemberIBBChrome";
import BalancePaymentPreview from "@/components/balance-preview/BalancePaymentPreview";
import { accountFor, readMemberSession, writeMemberSession } from "@/components/member-preview/session";
import type { MemberSession } from "@/components/member-preview/session";
import { memberLoginHref, safeMemberReturnTo } from "@/components/member-preview/member-navigation";
import { getStoredLanguage } from "@/contexts/LanguageContext";
import { copyFor, memberUrl, money, PageHeading, Panel, PreviewDialog, Status } from "@/components/member-preview/ui";
import type { MemberPageProps, PreviewLanguage } from "@/components/member-preview/ui";
import { balanceForAccount, currencyOptions } from "@/components/balance-preview/payment-config";
import "@/components/member-preview/member-preview.css";
import "@/components/member-preview/ibb-member-brand.css";

export default function MemberPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<MemberSession | null>(readMemberSession);
  const [language, setLanguage] = useState<PreviewLanguage>(() => readMemberSession()?.language ?? getStoredLanguage());
  const [profile, setProfile] = useState(() => readMemberSession()?.profile ?? accountFor("alex@example.com").profile);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [signoutOpen, setSignoutOpen] = useState(false);
  const c = copyFor(language);
  const page = location.pathname.replace(/^\/member-preview\/?/, "").replace(/\/$/, "") || "shuttle/overview";
  const isAccount = page.startsWith("account/");
  const tier = session?.tier ?? "VIP";
  const canDeposit = tier !== "General";
  const accountPage = page.replace(/^account\//, "");
  const isLogin = page === "login" || page === "register";

  useEffect(() => {
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    writeMemberSession(session ? { ...session, profile, language } : null);
  }, [session, profile, language]);

  function signIn(email: string, name?: string) {
    const next = { ...accountFor(email, name), language };
    setProfile(next.profile);
    setSession(next);
    setMessage("");
    writeMemberSession(next);
    const returnTo = safeMemberReturnTo(new URLSearchParams(location.search).get("returnTo"));
    navigate(returnTo ?? memberUrl("shuttle/overview"), { replace: true });
  }

  const accountNav = [
    { path: "account/profile", icon: UserRound, title: c("Personal information", "ข้อมูลส่วนตัว") },
    { path: "account/security", icon: LockKeyhole, title: c("Login & security", "การเข้าสู่ระบบและความปลอดภัย") },
    { path: "account/preferences", icon: Settings2, title: c("Preferences", "การตั้งค่า") },
  ];
  const shuttleNav = [
    { path: "shuttle/overview", icon: LayoutDashboard, title: c("Overview", "ภาพรวม") },
    { path: "shuttle/bookings", icon: CalendarDays, title: c("My bookings", "การจองของฉัน") },
    ...(canDeposit ? [{ path: "shuttle/balance", icon: Wallet, title: c("Balance & Payments", "ยอดคงเหลือและการชำระเงิน") }] : []),
    { path: "shuttle/membership", icon: ShieldCheck, title: c("Membership", "สิทธิ์สมาชิก") },
    ...(tier === "Business Partner" ? [{ path: "shuttle/reports", icon: Building2, title: c("Organization reports", "รายงานองค์กร") }] : []),
  ];
  const props: MemberPageProps = { page, language, tier, accountKey: session?.accountKey ?? "", profile, onProfileChange: setProfile, onLanguageChange: setLanguage, notify: setMessage };
  const navigation = (items: typeof accountNav) => items.map(({ path, icon: Icon, title }) => <NavLink key={path} to={memberUrl(path)} className={({ isActive }) => `mp-nav-link ${isActive || (path === "shuttle/bookings" && page.startsWith("shuttle/booking/")) ? "mp-nav-active" : ""}`}><Icon size={18} aria-hidden="true"/><span>{title}</span></NavLink>);

  if (isLogin) return <MemberSignIn key={page} language={language} register={page === "register"} onLanguageChange={setLanguage} onSignIn={signIn}/>;
  if (!session) return <Navigate to={memberLoginHref(`${location.pathname}${location.search}`)} replace/>;
  if (["overview", "services", "profile", "security", "preferences", "membership"].includes(page)) return <Navigate to={memberUrl(page)} replace/>;
  if (isAccount && !["profile", "security", "preferences"].includes(accountPage)) return <Navigate to={memberUrl("profile")} replace/>;
  if (!isAccount && !page.startsWith("shuttle/")) return <Navigate to={memberUrl("shuttle/overview")} replace/>;

  const displayedBalance = balanceForAccount(currencyOptions[0].exampleBalance, session.accountKey);
  const isBalance = page === "shuttle/balance";

  return <div className="ibb-member-page" data-member-space={isAccount ? "account" : "shuttle"}>
    <MemberIBBHeader signedIn canDeposit={canDeposit} language={language} onLanguageChange={setLanguage}/>
    <div className={`member-preview mp-branded-member ${isBalance ? "mp-full-balance" : ""}`}>
    <a className="mp-skip" href="#member-main">{c("Skip to content", "ข้ามไปเนื้อหา")}</a>
    <div className="mp-ibb-memberbar container mx-auto px-4">
      <div className="mp-ibb-member-identity">{!isBalance && <button className="mp-icon-button mp-mobile-toggle" aria-label={c("Open account menu", "เปิดเมนูบัญชี")} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={22}/> : <Menu size={22}/>}</button>}<span>{profile.name}</span><Status tone="green">{tier}</Status></div>
      <div className="mp-ibb-member-actions"><Link className="mp-text-link" to={memberUrl(isAccount || isBalance ? "shuttle/overview" : "profile")}>{isAccount || isBalance ? <Car size={16}/> : <UserRound size={16}/>}<span>{isAccount || isBalance ? c("Back to Shuttle account", "กลับพื้นที่สมาชิก Shuttle") : c("My IBB account", "บัญชี IBB ของฉัน")}</span></Link><button className="mp-text-link" onClick={() => setSignoutOpen(true)}><LogOut size={16}/>{c("Sign out", "ออกจากระบบ")}</button></div>
    </div>
    {isBalance ? <main id="member-main" className="container mx-auto px-4 py-12">
      <div className="text-center mb-8"><h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{c("Balance & Payments", "ยอดคงเหลือและการชำระเงิน")}</h1><p className="text-lg text-muted-foreground max-w-2xl mx-auto">{c("Choose a currency, view transfer details, and notify us of an advance payment.", "เลือกสกุลเงิน ดูข้อมูลรับโอน และแจ้งโอนเงินล่วงหน้า")}</p></div>
      {canDeposit ? <BalancePaymentPreview language={language} fullPage memberTier={tier} ownerName={profile.name} accountKey={session.accountKey}/> : <Panel title={c("Available to VIP+ members", "สำหรับสมาชิก VIP ขึ้นไป")} description={c("Advance payments are available to VIP, VVIP and Business Partner members.", "การฝากเงินล่วงหน้าสำหรับสมาชิก VIP, VVIP และ Business Partner")}><Link className="mp-button" to={memberUrl("shuttle/bookings")}>{c("My bookings", "การจองของฉัน")}</Link></Panel>}
    </main> : <div className="mp-workspace">
      {mobileMenu && <button className="mp-mobile-scrim" aria-label={c("Close menu", "ปิดเมนู")} onClick={() => setMobileMenu(false)}/>}
      <aside className={`mp-sidebar ${mobileMenu ? "mp-sidebar-open" : ""}`} aria-label={c("Account navigation", "เมนูบัญชี")}>
        <div className="mp-sidebar-member"><span className="mp-member-initial">{profile.name.charAt(0)}</span><div><strong>{profile.name}</strong><span>{isAccount ? profile.email : `${tier} · Shuttle`}</span></div></div>
        <nav aria-label={isAccount ? c("My IBB account", "บัญชี IBB ของฉัน") : "Shuttle Service"}><p className="mp-nav-label">{isAccount ? "MY IBB ACCOUNT" : "SHUTTLE SERVICE"}</p>{navigation(isAccount ? accountNav : shuttleNav)}</nav>
        <div className="mp-service-nav"><Link className="mp-nav-link" to={memberUrl(isAccount ? "shuttle/overview" : "profile")}>{isAccount ? <ArrowLeft size={18}/> : <UserRound size={18}/>}<span>{isAccount ? c("Back to Shuttle", "กลับไป Shuttle") : c("My IBB account", "บัญชี IBB ของฉัน")}</span></Link></div>
        <div className="mp-sidebar-bottom"><button className="mp-nav-link" onClick={() => setSignoutOpen(true)}><LogOut size={18}/><span>{c("Sign out", "ออกจากระบบ")}</span></button></div>
      </aside>
      <main id="member-main" className="mp-main">
        <div className="mp-breadcrumb"><span>IBB</span><span>/</span><span>{isAccount ? c("My IBB account", "บัญชี IBB ของฉัน") : "Shuttle Service"}</span></div>
        {page === "shuttle/overview" ? <>
          <PageHeading eyebrow="IBB SHUTTLE SERVICE" title={c(`Welcome back, ${profile.name.split(" ")[0]}.`, `ยินดีต้อนรับ ${profile.name.split(" ")[0]}`)} description={c("Manage your journeys and payments in one place.", "ดูการจองและการชำระเงินของ Shuttle ในที่เดียว")}/>
          <div className="mp-shuttle-home">
            <Panel title={c("My bookings", "การจองของฉัน")} description={c("Upcoming trips, booking details and past journeys.", "การเดินทางที่กำลังจะมาถึง รายละเอียดการจอง และประวัติการเดินทาง")}><span className="mp-service-emblem"><CalendarDays size={26}/></span><div className="mp-actions"><Link className="mp-button" to={memberUrl("shuttle/bookings")}>{c("View bookings", "ดูการจอง")}<ArrowRight size={16}/></Link></div></Panel>
            {canDeposit ? <Panel title={c("Balance & Payments", "ยอดคงเหลือและการชำระเงิน")} description={c("Your Shuttle balance and transfer notices.", "ยอดคงเหลือและรายการแจ้งโอนของ Shuttle")}><p className="mp-small-label">{c("AVAILABLE BALANCE · THB", "ยอดพร้อมใช้ · THB")}</p><p className="mp-amount">{money(displayedBalance)}</p><div className="mp-actions"><Link className="mp-button" to={memberUrl("shuttle/balance")}>{c("View balance", "ดูยอดคงเหลือ")}<ArrowRight size={16}/></Link></div></Panel> : <Panel title={c("Pay per booking", "ชำระเป็นรายจอง")} description={c("Pay for each Shuttle journey in THB.", "ชำระค่าบริการ Shuttle เป็น THB ต่อการจอง")}><Status tone="muted">General</Status><div className="mp-actions"><Link className="mp-button mp-button-secondary" to={memberUrl("membership")}>{c("View membership", "ดูสิทธิ์สมาชิก")}<ArrowRight size={16}/></Link></div></Panel>}
          </div>
          <Panel title={c("Your IBB account", "บัญชี IBB ของคุณ")} description={c("Manage personal information and your password without leaving your account.", "จัดการข้อมูลส่วนตัวและรหัสผ่านในบัญชี IBB ของคุณ")}><div className="mp-central-shortcuts"><Link className="mp-text-link" to={memberUrl("profile")}><UserRound size={17}/>{c("Personal information", "ข้อมูลส่วนตัว")}<ArrowRight size={15}/></Link><Link className="mp-text-link" to={memberUrl("security")}><LockKeyhole size={17}/>{c("Login & security", "การเข้าสู่ระบบและความปลอดภัย")}<ArrowRight size={15}/></Link></div></Panel>
        </> : isAccount ? <AccountPages {...props} page={accountPage}/> : page === "shuttle/membership" ? <AccountPages {...props} page="membership"/> : <ShuttlePages {...props}/>}
      </main>
    </div>}
    {message && <div className="mp-feedback" role="status">{message}<button aria-label={c("Dismiss", "ปิดข้อความ")} onClick={() => setMessage("")}><X size={16}/></button></div>}
    {signoutOpen && <PreviewDialog title={c("Sign out?", "ออกจากระบบ?")} description={c("You can sign in again whenever you need your account.", "คุณสามารถเข้าสู่ระบบอีกครั้งเมื่อต้องการใช้บัญชี")} onClose={() => setSignoutOpen(false)}><div className="mp-actions"><button className="mp-button mp-button-secondary" onClick={() => setSignoutOpen(false)}>{c("Cancel", "ยกเลิก")}</button><button className="mp-button" onClick={() => { setSignoutOpen(false); writeMemberSession(null); setSession(null); setMessage(""); navigate(memberUrl("login"), { replace: true }); }}>{c("Sign out", "ออกจากระบบ")}</button></div></PreviewDialog>}
    </div>
    <MemberIBBFooter/>
  </div>;
}
