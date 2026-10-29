import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { copyFor, memberUrl, PageHeading } from "./ui";
import { MemberIBBHeader, MemberIBBFooter } from "./MemberIBBChrome";
import type { PreviewLanguage } from "./ui";

interface Props {
  language: PreviewLanguage;
  register: boolean;
  onLanguageChange: (language: PreviewLanguage) => void;
  onSignIn: (email: string, name?: string) => void;
}

export default function MemberSignIn({ language, register, onLanguageChange, onSignIn }: Props) {
  const c = copyFor(language);
  const [email, setEmail] = useState(register ? "" : "alex@example.com");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !password || (register && !name.trim())) {
      setError(c("Please complete your account details.", "กรุณากรอกข้อมูลบัญชีให้ครบ"));
      return;
    }
    if (register && (password.length < 8 || password !== confirm)) {
      setError(c("Use at least 8 characters and match the password confirmation.", "ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษรและยืนยันให้ตรงกัน"));
      return;
    }
    setPassword("");
    setConfirm("");
    onSignIn(email, register ? name : undefined);
  }

  return <div className="ibb-member-page">
    <MemberIBBHeader signedIn={false} language={language} onLanguageChange={onLanguageChange}/>
    <div className="member-preview mp-login-page mp-branded-signin">
    <main className="mp-login-main">
      <Link className="mp-text-link" to={`/${language}/shuttle`}><ArrowLeft size={15}/>{c("Back to Shuttle", "กลับไป Shuttle")}</Link>
      <section className="mp-login-card">
        <PageHeading eyebrow="IBB SHUTTLE SERVICE" title={register ? c("Create your IBB account", "สร้างบัญชี IBB") : c("Sign in to your IBB account", "เข้าสู่บัญชี IBB ของคุณ")} description={c("Continue to your Shuttle bookings and payments.", "เข้าสู่การจองและการชำระเงินของ Shuttle")}/>
        <form className="mp-login-form" onSubmit={submit}>
          {register && <label className="mp-field">{c("Name", "ชื่อ")}<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required/></label>}
          <label className="mp-field">{c("Email", "อีเมล")}<input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} autoComplete="email" required/></label>
          <label className="mp-field">{c("Password", "รหัสผ่าน")}<span className="mp-password-input"><input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} autoComplete="off" required/><button type="button" className="mp-icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? c("Hide password", "ซ่อนรหัสผ่าน") : c("Show password", "แสดงรหัสผ่าน")}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
          {register && <label className="mp-field">{c("Confirm password", "ยืนยันรหัสผ่าน")}<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="off" required/></label>}
          {error && <p className="mp-error mp-login-error" role="alert">{error}</p>}
          <button className="mp-button" type="submit">{register ? c("Create account", "สร้างบัญชี") : c("Sign in", "เข้าสู่ระบบ")}<ArrowRight size={17}/></button>
        </form>
        <p className="mp-login-switch mp-description">{register ? c("Already have an IBB account?", "มีบัญชี IBB แล้ว?") : c("New to IBB?", "ยังไม่มีบัญชี IBB?")} <Link className="mp-text-link" to={memberUrl(register ? "login" : "register")}>{register ? c("Sign in", "เข้าสู่ระบบ") : c("Create an account", "สร้างบัญชี")}</Link></p>
      </section>
    </main>
    </div>
    <MemberIBBFooter/>
  </div>;
}
