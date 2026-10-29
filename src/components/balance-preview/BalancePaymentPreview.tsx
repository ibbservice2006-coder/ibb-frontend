import { useEffect, useRef, useState, type FormEvent } from "react";
import { Building2, Check, CheckCircle2, ChevronRight, Copy, FileText, QrCode, Upload, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaymentQrCard from "@/components/payments/PaymentQrCard";
import { balanceForAccount, currencyOptions, exampleTransferNotices, type CurrencyCode, type MethodId, type ReceivingMethod, type TransferNotice, type TransferStatus } from "./payment-config";
import "./balance-payment-preview.css";

interface Props { language: string; embedded?: boolean; fullPage?: boolean; memberTier?: string; ownerName?: string; accountKey?: string }
type Notice = TransferNotice & { proof?: File; reference?: string; receivingMethod?: ReceivingMethod };

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const emptyForm = () => ({ amount: "", date: localDate(), time: "", otherPayer: false, payerName: "", reference: "", note: "" });
const formatAmount = (amount: number, currency: CurrencyCode) => new Intl.NumberFormat("en-US", {
  style: "currency", currency, currencyDisplay: "code", minimumFractionDigits: currency === "JPY" ? 0 : 2,
}).format(amount);
const statusCopy: Record<TransferStatus, [string, string]> = {
  pending: ["Pending review", "รอตรวจสอบ"], approved: ["Approved", "อนุมัติแล้ว"],
  needs_info: ["More information needed", "ขอข้อมูลเพิ่มเติม"], rejected: ["Not approved", "ไม่อนุมัติ"],
};
function noticesForAccount(email: string): Notice[] {
  const key = email.trim().toLowerCase();
  const source = key === "alex@example.com" ? exampleTransferNotices : key === "jamie@example.com" ? exampleTransferNotices.filter(n => n.currency !== "THB") : key === "company@example.com" ? exampleTransferNotices.filter(n => n.status === "approved") : [];
  return source.map(n => ({ ...n, id: `TP-${key.charAt(0).toUpperCase()}-${n.id.replace("DEMO-", "")}`, note: n.status === "needs_info" ? "Please attach a clearer transfer receipt." : undefined }));
}

export default function BalancePaymentPreview({ language, embedded = false, fullPage = false, memberTier = "VIP", ownerName = "Alex Morgan", accountKey = "alex@example.com" }: Props) {
  const th = language === "th";
  const text = (en: string, thai: string) => th ? thai : en;
  const [view, setView] = useState<"wallet" | "transfer">(embedded ? "wallet" : "transfer");
  const [currency, setCurrency] = useState<CurrencyCode>("THB");
  const [methodId, setMethodId] = useState<MethodId>("thai_bank");
  const [form, setForm] = useState(emptyForm);
  const [proof, setProof] = useState<File | null>(null);
  const [records, setRecords] = useState<Notice[]>(() => noticesForAccount(accountKey));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState("");
  const [detail, setDetail] = useState<Notice | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const selectedCurrency = currencyOptions.find(item => item.code === currency)!;
  const selectedMethod = selectedCurrency.methods.find(item => item.id === methodId) ?? selectedCurrency.methods[0];
  const availableBalance = balanceForAccount(selectedCurrency.exampleBalance, accountKey);
  const completedBookingId = accountKey === "jamie@example.com" ? "IBB-J003" : accountKey === "company@example.com" ? "IBB-C003" : "IBB-003";
  const currencyRecords = records.filter(item => item.currency === currency);
  const pendingAmount = currencyRecords.filter(item => item.status === "pending" || item.status === "needs_info").reduce((total, item) => total + item.amount, 0);
  const reservedForForm = currencyRecords.filter(item => item.id !== editingId && (item.status === "pending" || item.status === "needs_info")).reduce((total, item) => total + item.amount, 0);
  const remainingRoom = selectedCurrency.exampleLimit === null ? null : Math.max(0, selectedCurrency.exampleLimit - availableBalance - reservedForForm);

  useEffect(() => {
    setRecords(noticesForAccount(accountKey));
    setDetail(null);
    setEditingId(null);
    setForm(emptyForm());
    setProof(null);
    setSuccess("");
    setError("");
  }, [accountKey]);
  useEffect(() => {
    if (!detail?.proof) { setProofUrl(null); return; }
    const url = URL.createObjectURL(detail.proof);
    setProofUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [detail]);

  function clearProof() {
    setProof(null);
    if (uploadRef.current) uploadRef.current.value = "";
  }
  function changeCurrency(next: CurrencyCode) {
    setCurrency(next);
    setMethodId(currencyOptions.find(item => item.code === next)!.methods[0].id);
    setForm(emptyForm()); setEditingId(null); clearProof(); setError(""); setSuccess("");
  }
  function changeMethod(next: MethodId) {
    setMethodId(next); setEditingId(null); setForm(emptyForm()); clearProof(); setError(""); setSuccess("");
  }
  async function copyDetail(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value); window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError(text("Select the account details to copy them manually.", "เลือกข้อมูลบัญชีเพื่อคัดลอกด้วยตนเอง"));
    }
  }
  function selectProof(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      setError(text("Please choose a JPG, PNG or PDF file.", "กรุณาเลือกไฟล์ JPG, PNG หรือ PDF")); clearProof(); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(text("The file must be no larger than 10 MB.", "ไฟล์ต้องมีขนาดไม่เกิน 10 MB")); clearProof(); return;
    }
    setProof(file); setError(""); setSuccess("");
  }
  function submitNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess("");
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0 || (currency === "JPY" && !Number.isInteger(amount))) {
      setError(text("Enter a valid transfer amount.", "กรุณากรอกจำนวนเงินที่ถูกต้อง")); return;
    }
    if (remainingRoom !== null && amount > remainingRoom) {
      setError(text(`The amount exceeds the available limit of ${formatAmount(remainingRoom, currency)}.`, `ยอดเกินวงเงินที่รับเพิ่มได้ ${formatAmount(remainingRoom, currency)}`)); return;
    }
    if (!form.date || !form.time || form.date > localDate()) {
      setError(text("Enter the transfer date and time. The date cannot be in the future.", "กรุณาระบุวันและเวลาโอน โดยวันที่ต้องไม่อยู่ในอนาคต")); return;
    }
    if (!proof) { setError(text("Attach your transfer proof before submitting.", "กรุณาแนบหลักฐานการโอนก่อนส่ง")); return; }
    if (form.otherPayer && !form.payerName.trim()) { setError(text("Enter the payer or company name.", "กรุณาระบุชื่อผู้จ่ายหรือบริษัทที่จ่ายแทน")); return; }
    const notice: Notice = {
      id: editingId ?? `TP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      currency, methodId: selectedMethod.id, amount, date: form.date, time: form.time,
      status: "pending", fileName: proof.name, proof,
      payerName: form.otherPayer ? form.payerName.trim() : undefined,
      reference: form.reference.trim() || undefined, note: form.note.trim() || undefined,
      receivingMethod: { ...selectedMethod, details: selectedMethod.details.map(item => ({ ...item })) },
    };
    setRecords(current => editingId ? current.map(item => item.id === editingId ? notice : item) : [notice, ...current]);
    setSuccess(text("Transfer notice received. Waiting for Admin approval.", "รับรายการแจ้งโอนแล้ว รอ Admin ตรวจสอบและอนุมัติ"));
    setForm(emptyForm()); clearProof(); setEditingId(null);
  }
  function provideInformation(notice: Notice) {
    setView("transfer"); setMethodId(notice.methodId); setEditingId(notice.id);
    setForm({ amount: String(notice.amount), date: notice.date, time: notice.time, otherPayer: Boolean(notice.payerName), payerName: notice.payerName ?? "", reference: notice.reference ?? "", note: "" });
    clearProof(); setDetail(null); setSuccess(""); setError("");
    window.setTimeout(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); uploadRef.current?.focus(); }, 100);
  }
  function renderDetails(method: ReceivingMethod) {
    return <dl className="bp-account-details">{method.details.map(item => <div key={item.labelEn} className="bp-detail-line"><dt className="text-sm text-muted-foreground">{th ? item.labelTh : item.labelEn}</dt><dd className="text-sm flex items-center gap-2"><span>{item.value}</span>{method.kind === "bank" && item.value !== "—" && <button type="button" className="bp-copy" onClick={() => copyDetail(item.value)} aria-label={`${text("Copy", "คัดลอก")} ${th ? item.labelTh : item.labelEn}`}>{copied === item.value ? <Check size={15}/> : <Copy size={15}/>}</button>}</dd></div>)}</dl>;
  }

  if (memberTier === "General") return <p>{text("Advance payments are available to VIP members and above.", "การฝากเงินล่วงหน้าสำหรับสมาชิก VIP ขึ้นไป")}</p>;

  return <div className={`bp-preview ${embedded ? "bp-embedded" : ""}`} data-balance-payment-preview>
    {!fullPage && <div className="bp-tabs" role="tablist" aria-label={text("Balance and payments", "ยอดคงเหลือและการชำระเงิน")}>
      <button type="button" role="tab" aria-selected={view === "wallet"} className={`bp-tab ${view === "wallet" ? "is-selected" : ""}`} onClick={() => setView("wallet")}><Wallet size={17}/>{text("Wallet", "กระเป๋าเงิน")}</button>
      <button type="button" role="tab" aria-selected={view === "transfer"} className={`bp-tab ${view === "transfer" ? "is-selected" : ""}`} onClick={() => setView("transfer")}><Upload size={17}/>{text("Notify transfer", "แจ้งโอนเงินล่วงหน้า")}</button>
    </div>}
    <section className="bp-summary" aria-label={text("Your Shuttle balance", "ยอดคงเหลือ Shuttle ของคุณ")}>
      <div className="bp-currency"><Label htmlFor="bp-currency">{text("Currency", "สกุลเงิน")}</Label><select id="bp-currency" value={currency} onChange={event => changeCurrency(event.target.value as CurrencyCode)}>{currencyOptions.map(item => <option value={item.code} key={item.code}>{item.code} — {th ? item.nameTh : item.nameEn}</option>)}</select><span className="text-xs text-muted-foreground">{memberTier} · Shuttle</span></div>
      <div className="bp-balance"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet size={17}/>{text("Current balance", "ยอดคงเหลือ")}</div><div className="text-3xl font-bold text-primary" data-example-balance>{formatAmount(availableBalance, currency)}</div><span className="text-xs text-muted-foreground">{ownerName}</span></div>
      <div className="bp-limit text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">{text("Pending review", "รอตรวจสอบ")}</span><span>{formatAmount(pendingAmount, currency)}</span></div>{fullPage && selectedCurrency.exampleLimit !== null && <div className="flex justify-between gap-3"><span className="text-muted-foreground">{text("Balance ceiling", "เพดานยอดคงเหลือ")}</span><span>{formatAmount(selectedCurrency.exampleLimit, currency)}</span></div>}<p className="text-xs text-muted-foreground">{text("Available after approval", "ใช้ได้หลังผ่านการอนุมัติ")}</p></div>
    </section>

    {!fullPage && view === "wallet" ? <section className="bp-wallet-history">
      <div className="bp-history-heading"><div><h2 className="text-xl font-semibold">{text("Wallet history", "ประวัติกระเป๋าเงิน")}</h2><p className="text-sm text-muted-foreground">{text("Approved advance payments and service deductions.", "เงินล่วงหน้าที่อนุมัติและรายการหักค่าบริการ")}</p></div></div>
      <div className="bp-history-list">
        {currency === "THB" && availableBalance > 0 && <div className="bp-history-row"><span className="bp-notice-icon"><CarIcon/></span><div className="bp-notice-description"><span className="text-sm">{text(`Shuttle booking · ${completedBookingId}`, `ค่าบริการ Shuttle · ${completedBookingId}`)}</span><span className="text-xs text-muted-foreground">2026-10-14</span></div><span className="bp-notice-amount text-sm font-semibold">− {formatAmount(7200, currency)}</span></div>}
        {availableBalance > 0 ? <div className="bp-history-row"><span className="bp-notice-icon"><Wallet size={19}/></span><div className="bp-notice-description"><span className="text-sm">{text("Advance payment approved", "เงินล่วงหน้าที่อนุมัติแล้ว")}</span><span className="text-xs text-muted-foreground">2026-10-01</span></div><span className="bp-notice-amount text-sm font-semibold">+ {formatAmount(availableBalance + (currency === "THB" ? 7200 : 0), currency)}</span></div> : <div className="bp-empty text-sm text-muted-foreground"><Wallet size={26}/><p>{text("No wallet transactions yet.", "ยังไม่มีรายการกระเป๋าเงิน")}</p></div>}
      </div>
    </section> : <>
      <div className="bp-workspace">
        <section className="bp-panel" aria-labelledby="bp-transfer-title">
          <div className="bp-panel-heading"><span className="bp-step text-sm" aria-hidden="true">1</span><div><h2 id="bp-transfer-title" className="text-xl font-semibold">{text("Transfer details", "ข้อมูลรับโอน")}</h2><p className="text-sm text-muted-foreground">{text("Choose a payment method.", "เลือกช่องทางรับเงิน")}</p></div></div>
          <div className="bp-methods" role="group" aria-label={text("Payment method", "ช่องทางรับเงิน")}>{selectedCurrency.methods.map(method => <button type="button" key={method.id} aria-pressed={method.id === selectedMethod.id} className={`bp-method text-sm ${method.id === selectedMethod.id ? "is-selected" : ""}`} onClick={() => changeMethod(method.id)}>{method.kind === "qr" ? <QrCode size={17}/> : <Building2 size={17}/>}<span>{method.name}</span>{method.id === selectedMethod.id && <Check size={16} className="ml-auto"/>}</button>)}</div>
          <div className="bp-receiving"><h3 className="text-sm font-medium mb-4">{selectedMethod.name}</h3>{selectedMethod.kind === "qr" && (selectedMethod.id === "wechat" || selectedMethod.id === "alipay" ? <PaymentQrCard method={selectedMethod.id} language={language} showRecipient={false}/> : <div className="bp-qr"><QrCode size={96} strokeWidth={1.3} aria-hidden="true"/><p className="text-sm font-medium">{text("Payment QR", "QR รับเงิน")}</p><Button type="button" size="sm" variant="outline" disabled>{text("Save QR", "บันทึก QR")}</Button></div>)}{renderDetails(selectedMethod)}{selectedMethod.extraDetails?.length ? <details className="bp-more-details"><summary className="text-sm">{text("More transfer details", "รายละเอียดการโอนเพิ่มเติม")}</summary><dl>{selectedMethod.extraDetails.map(item => <div className="mt-3" key={item.labelEn}><dt className="text-xs text-muted-foreground">{th ? item.labelTh : item.labelEn}</dt><dd className="text-sm mt-1">{item.value}</dd></div>)}</dl></details> : null}</div>
          <div className="bp-review-note text-sm"><CheckCircle2 size={18} className="shrink-0 text-primary"/><p>{text("Transfer first, then send your proof. Your balance is credited after Admin approval.", "โอนเงินแล้วส่งหลักฐาน ยอดจะเพิ่มหลัง Admin ตรวจสอบและอนุมัติ")}</p></div>
        </section>
        <section className="bp-panel" aria-labelledby="bp-proof-title">
          <div className="bp-panel-heading"><span className="bp-step text-sm" aria-hidden="true">2</span><div><h2 id="bp-proof-title" className="text-xl font-semibold">{text("Submit transfer proof", "ส่งหลักฐานการโอน")}</h2><p className="text-sm text-muted-foreground">{text("Notify us after making the transfer.", "แจ้งรายการหลังจากโอนเงินแล้ว")}</p></div></div>
          <form ref={formRef} onSubmit={submitNotice} noValidate className="bp-proof-form">
            <div className="bp-form-context text-sm"><span>{currency}</span><ChevronRight size={14} aria-hidden="true"/><span>{selectedMethod.name}</span></div>
            {editingId && <div className="bp-editing text-sm"><span>{text("Providing information for", "เพิ่มข้อมูลให้รายการ")} {editingId}</span><button type="button" onClick={() => { setEditingId(null); setForm(emptyForm()); clearProof(); setError(""); }} aria-label={text("Cancel update", "ยกเลิกการเพิ่มข้อมูล")}><X size={16}/></button></div>}
            <div className="space-y-2"><Label htmlFor="bp-amount">{text("Amount transferred", "จำนวนเงินที่โอน")} ({currency})</Label><Input id="bp-amount" type="number" inputMode="decimal" min={currency === "JPY" ? 1 : 0.01} step={currency === "JPY" ? 1 : 0.01} placeholder="0" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} required/>{remainingRoom !== null && <p className="text-xs text-muted-foreground">{text("Available transfer limit:", "วงเงินที่รับเพิ่มได้:")} {formatAmount(remainingRoom, currency)}</p>}</div>
            <div className="bp-date-time"><div className="space-y-2"><Label htmlFor="bp-date">{text("Transfer date", "วันที่โอน")}</Label><Input id="bp-date" type="date" max={localDate()} value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} required/></div><div className="space-y-2"><Label htmlFor="bp-time">{text("Transfer time", "เวลาที่โอน")}</Label><Input id="bp-time" type="time" value={form.time} onChange={event => setForm({ ...form, time: event.target.value })} required/></div></div>
            <div className="space-y-2"><Label htmlFor="bp-proof">{text("Transfer proof", "หลักฐานการโอน")}</Label><div className={`bp-upload ${proof ? "has-file" : ""}`}><Upload size={23} className="text-primary" aria-hidden="true"/><div><p className="text-sm">{proof ? proof.name : text("Choose your transfer receipt", "เลือกหลักฐานการโอน")}</p><p className="text-xs text-muted-foreground">{text("JPG, PNG or PDF · Up to 10 MB", "JPG, PNG หรือ PDF · ไม่เกิน 10 MB")}</p></div><input ref={uploadRef} id="bp-proof" type="file" accept="image/jpeg,image/png,application/pdf" onChange={event => selectProof(event.target.files?.[0])} aria-label={text("Choose transfer proof", "เลือกหลักฐานการโอน")}/>{proof && <button type="button" onClick={clearProof} className="bp-remove-file" aria-label={text("Remove selected file", "ลบไฟล์ที่เลือก")}><X size={16}/></button>}</div></div>
            <label className="bp-payer-toggle text-sm"><input type="checkbox" checked={form.otherPayer} onChange={event => setForm({ ...form, otherPayer: event.target.checked })}/><span>{text("Paid by another person or company", "บุคคลอื่นหรือบริษัทเป็นผู้จ่ายแทน")}</span></label>
            {form.otherPayer && <div className="space-y-2"><Label htmlFor="bp-payer">{text("Payer / company name", "ชื่อผู้จ่าย / บริษัท")}</Label><Input id="bp-payer" value={form.payerName} onChange={event => setForm({ ...form, payerName: event.target.value })} required/></div>}
            <details className="bp-optional-fields"><summary className="text-sm">{text("Add a reference or note (optional)", "เพิ่มเลขอ้างอิงหรือหมายเหตุ (ไม่บังคับ)")}</summary><div className="space-y-2 mt-4"><Label htmlFor="bp-reference">{text("Transfer reference", "เลขอ้างอิงการโอน")}</Label><Input id="bp-reference" value={form.reference} onChange={event => setForm({ ...form, reference: event.target.value })}/></div><div className="space-y-2 mt-4"><Label htmlFor="bp-note">{text("Note", "หมายเหตุ")}</Label><Textarea id="bp-note" rows={2} value={form.note} onChange={event => setForm({ ...form, note: event.target.value })}/></div></details>
            {error && <p className="bp-error text-sm" role="alert">{error}</p>}{success && <p className="bp-success text-sm" role="status"><CheckCircle2 size={18} className="shrink-0"/>{success}</p>}
            <Button type="submit" className="w-full"><Upload className="mr-2 h-4 w-4"/>{text("Submit transfer proof", "ส่งหลักฐานการโอน")}</Button>
          </form>
        </section>
      </div>
      <section className="bp-history" aria-labelledby="bp-history-title"><div className="bp-history-heading"><div><h2 id="bp-history-title" className="text-xl font-semibold">{text("Transfer notices", "รายการแจ้งโอน")}</h2><p className="text-sm text-muted-foreground">{text("Open a notice to view its details and status.", "กดรายการเพื่อดูรายละเอียดและสถานะ")}</p></div><span className="text-sm text-muted-foreground">{currency}</span></div><div className="bp-history-list">{currencyRecords.length === 0 ? <div className="bp-empty text-sm text-muted-foreground"><FileText size={26}/><p>{text("No transfer notices yet.", "ยังไม่มีรายการแจ้งโอน")}</p></div> : currencyRecords.map(notice => <button type="button" key={notice.id} className="bp-history-row" onClick={() => setDetail(notice)} aria-label={`${text("View notice", "ดูรายการ")} ${notice.id}`}><div className="bp-notice-icon"><FileText size={19}/></div><div className="bp-notice-description"><span className="text-sm">{currencyOptions.find(item => item.code === notice.currency)!.methods.find(item => item.id === notice.methodId)?.name}</span><span className="text-xs text-muted-foreground">{notice.date} · {notice.time} · {notice.id}</span></div><span className={`bp-status bp-status-${notice.status} text-xs`}>{statusCopy[notice.status][th ? 1 : 0]}</span><span className="bp-notice-amount text-sm font-semibold">{formatAmount(notice.amount, notice.currency)}</span><ChevronRight size={17} className="text-muted-foreground"/></button>)}</div></section>
    </>}

    <Dialog open={Boolean(detail)} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent className="bp-detail-dialog max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{text("Transfer notice details", "รายละเอียดรายการแจ้งโอน")}</DialogTitle><DialogDescription>{detail?.id}</DialogDescription></DialogHeader>{detail && <div className="space-y-5"><div className="flex items-center justify-between gap-3"><span className="text-sm">{detail.id}</span><span className={`bp-status bp-status-${detail.status} text-xs`}>{statusCopy[detail.status][th ? 1 : 0]}</span></div><div className="text-3xl font-bold text-primary">{formatAmount(detail.amount, detail.currency)}</div><dl className="bp-notice-fields text-sm"><div><dt className="text-muted-foreground">{text("Transferred on", "วันเวลาโอน")}</dt><dd>{detail.date} · {detail.time}</dd></div><div><dt className="text-muted-foreground">{text("Method", "ช่องทาง")}</dt><dd>{(detail.receivingMethod ?? currencyOptions.find(item => item.code === detail.currency)!.methods.find(item => item.id === detail.methodId))?.name}</dd></div>{detail.payerName && <div><dt className="text-muted-foreground">{text("Payer", "ผู้จ่าย")}</dt><dd>{detail.payerName}</dd></div>}{detail.reference && <div><dt className="text-muted-foreground">{text("Reference", "เลขอ้างอิง")}</dt><dd>{detail.reference}</dd></div>}{detail.fileName && <div><dt className="text-muted-foreground">{text("Proof", "หลักฐาน")}</dt><dd>{detail.fileName}</dd></div>}</dl>{detail.note && <div className="bp-detail-note text-sm"><p className="font-medium mb-1">{text("Note", "หมายเหตุ")}</p><p>{detail.note}</p></div>}{proofUrl && detail.proof && (detail.proof.type === "application/pdf" ? <a className="text-sm underline text-primary" href={proofUrl} target="_blank" rel="noopener noreferrer">{text("Open PDF", "เปิด PDF")}</a> : <img className="bp-proof-image" src={proofUrl} alt={text("Transfer proof", "หลักฐานการโอน")}/>)}{detail.status === "pending" && <p className="bp-detail-note text-sm">{text("Waiting for Admin approval. This amount is not yet available for service payments.", "รอ Admin อนุมัติ ยอดนี้ยังใช้ชำระบริการไม่ได้")}</p>}{detail.status === "needs_info" && <Button type="button" className="w-full" onClick={() => provideInformation(detail)}>{text("Provide more information", "ส่งข้อมูลเพิ่มเติม")}</Button>}</div>}</DialogContent></Dialog>
  </div>;
}

function CarIcon() { return <FileText size={19}/>; }
