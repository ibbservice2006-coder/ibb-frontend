import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  MapPin,
  MessageCircleQuestion,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  EmptyState,
  LinkButton,
  PageHeading,
  Panel,
  PreviewDialog,
  PreviewNote,
  Status,
  copyFor,
  memberUrl,
  money,
} from "./ui";
import type { MemberPageProps, PreviewLanguage } from "./ui";

type BookingStatus = "pending" | "confirmed" | "completed";
type BookingFilter = "all" | "upcoming" | "past";
type BalanceCurrency = "THB" | "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "USDT" | "BTC" | "ETH" | "BNB";
type ReportRange = "all" | "october" | "november";

interface BookingRecord {
  id: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  vehicle: "Car" | "Van" | "Bus";
  pax: number;
  amount: number;
  currency: "THB";
  zone: string;
  status: BookingStatus;
}

const bookings: BookingRecord[] = [
  {
    id: "IBB-DEMO-001",
    date: "2026-11-17",
    time: "09:30",
    pickup: "Suvarnabhumi Airport (BKK)",
    dropoff: "Mandarin Oriental Bangkok",
    vehicle: "Car",
    pax: 2,
    amount: 1800,
    currency: "THB",
    zone: "Zone A · Bangkok Central",
    status: "pending",
  },
  {
    id: "IBB-DEMO-002",
    date: "2026-11-24",
    time: "13:00",
    pickup: "Bangkok Marriott Marquis Queen's Park",
    dropoff: "Don Mueang Airport (DMK)",
    vehicle: "Van",
    pax: 6,
    amount: 2600,
    currency: "THB",
    zone: "Zone B · Bangkok Airports",
    status: "confirmed",
  },
  {
    id: "IBB-DEMO-003",
    date: "2026-10-14",
    time: "08:00",
    pickup: "Chiang Mai International Airport",
    dropoff: "Four Seasons Resort Chiang Mai",
    vehicle: "Bus",
    pax: 18,
    amount: 7200,
    currency: "THB",
    zone: "Zone C · Chiang Mai",
    status: "completed",
  },
];

const fiatCurrencies: BalanceCurrency[] = ["THB", "USD", "EUR", "GBP", "JPY", "CNY"];
const vipBalances: Partial<Record<BalanceCurrency, number>> = {
  THB: 12000,
  USD: 420,
  EUR: 380,
  GBP: 320,
  JPY: 58000,
  CNY: 2400,
};
const vvipBalances: Partial<Record<BalanceCurrency, number>> = {
  THB: 42000,
  USD: 1600,
  EUR: 1450,
  GBP: 1200,
  JPY: 220000,
  CNY: 11000,
  USDT: 900,
  BTC: 0.03,
  ETH: 0.4,
  BNB: 1.8,
};

const currencyLabels: Record<BalanceCurrency, string> = {
  THB: "Thai baht",
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
  JPY: "Japanese yen",
  CNY: "Chinese yuan",
  USDT: "USDT",
  BTC: "Bitcoin",
  ETH: "Ether",
  BNB: "BNB",
};

const statusText = (status: BookingStatus, language: PreviewLanguage) => {
  const c = copyFor(language);
  if (status === "pending") return c("Pending Admin", "รอจัดรถ");
  if (status === "confirmed") return c("Confirmed", "ยืนยันแล้ว");
  return c("Completed", "เสร็จสิ้น");
};

const statusTone = (status: BookingStatus): "green" | "amber" | "muted" => {
  if (status === "pending") return "amber";
  if (status === "completed") return "muted";
  return "green";
};

const formatDate = (date: string, language: PreviewLanguage) =>
  new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));

const formatDemoAmount = (amount: number, currency: BalanceCurrency) =>
  fiatCurrencies.includes(currency) ? money(amount, currency) : `${amount} ${currency}`;

const vehicleIcon = (vehicle: BookingRecord["vehicle"]) => {
  if (vehicle === "Bus") return <Users size={17} aria-hidden="true" />;
  return <CarFront size={17} aria-hidden="true" />;
};

function DetailField({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="mp-field">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

function BookingStatusLabel({ booking, language }: { booking: BookingRecord; language: PreviewLanguage }) {
  return <Status tone={statusTone(booking.status)}>{statusText(booking.status, language)}</Status>;
}

function TripRequestDialog({
  language,
  onClose,
  onNotify,
}: {
  language: PreviewLanguage;
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const c = copyFor(language);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewing(true);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onNotify(c("Sample request saved locally as Pending Admin; nothing was submitted.", "บันทึกคำขอตัวอย่างไว้ในหน้านี้เป็นรอจัดรถแล้ว ไม่ได้ส่งข้อมูลจริง"));
  };

  return (
    <PreviewDialog
      title={c("New trip request · preview", "คำขอเดินทางใหม่ · ตัวอย่าง")}
      description={c(
        "This local preview uses sample details only. It does not open or submit the live booking form.",
        "ตัวอย่างนี้ใช้รายละเอียดจำลองเท่านั้น ไม่เปิดหรือส่งแบบฟอร์มจองจริง",
      )}
      onClose={onClose}
    >
      {submitted ? (
        <div className="space-y-4">
          <div className="mp-note">
            <CheckCircle2 size={17} aria-hidden="true" />
            <p>
              <strong>{c("Pending Admin", "รอจัดรถ")}</strong>{" "}
              {c(
                "is the sample outcome. An admin would manually assign the vehicle and driver; no automatic matching or instant confirmation is used.",
                "คือผลลัพธ์ตัวอย่าง โดย Admin จะเลือกรถและคนขับด้วยตนเอง ไม่มีการจับคู่อัตโนมัติหรือยืนยันทันที",
              )}
            </p>
          </div>
          <p className="mp-description">
            {c("This request did not create a live booking or payment transaction.", "คำขอนี้ไม่ได้สร้างการจองหรือธุรกรรมชำระเงินจริง")}
          </p>
          <div className="mp-actions">
            <button type="button" className="mp-button" onClick={onClose}>{c("Done", "เสร็จสิ้น")}</button>
          </div>
        </div>
      ) : reviewing ? (
        <div className="space-y-5">
          <div className="mp-detail-grid">
            <DetailField label={c("Pickup", "จุดรับ")}>Suvarnabhumi Airport (BKK)</DetailField>
            <DetailField label={c("Drop-off", "จุดส่ง")}>Mandarin Oriental Bangkok</DetailField>
            <DetailField label={c("Date and time", "วันและเวลา")}>17 Nov 2026 · 09:30</DetailField>
            <DetailField label={c("Vehicle and passengers", "รถและผู้โดยสาร")}>Car · 2 {c("passengers", "คน")}</DetailField>
          </div>
          <PreviewNote>
            {c("Fixed sample zone price: THB 1,800. Whole vehicle, not shared seats. The sample will remain Pending Admin.", "ราคาตัวอย่างตามโซน: 1,800 บาท เหมาคัน ไม่ใช่ที่นั่งร่วม และตัวอย่างจะอยู่ในสถานะรอจัดรถ")}
          </PreviewNote>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={() => setReviewing(false)}>{c("Back", "ย้อนกลับ")}</button>
            <button type="button" className="mp-button" onClick={handleSubmit}>{c("Confirm sample request", "ยืนยันคำขอตัวอย่าง")}</button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleReview}>
          <div className="mp-form-grid">
            <label className="mp-field">
              <span>{c("Pickup", "จุดรับ")}</span>
              <input className="mp-filter" value="Suvarnabhumi Airport (BKK)" readOnly />
            </label>
            <label className="mp-field">
              <span>{c("Drop-off", "จุดส่ง")}</span>
              <input className="mp-filter" value="Mandarin Oriental Bangkok" readOnly />
            </label>
            <label className="mp-field">
              <span>{c("Date", "วันที่")}</span>
              <input className="mp-filter" type="date" defaultValue="2026-11-17" readOnly />
            </label>
            <label className="mp-field">
              <span>{c("Time", "เวลา")}</span>
              <input className="mp-filter" type="time" defaultValue="09:30" readOnly />
            </label>
          </div>
          <PreviewNote>
            {c("Preview only: private whole vehicle, fixed sample zone pricing, and no seat sharing.", "ตัวอย่างเท่านั้น: รถเหมาคัน ราคาตัวอย่างตามโซน และไม่ใช่ที่นั่งร่วม")}
          </PreviewNote>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={onClose}>{c("Cancel", "ยกเลิก")}</button>
            <button type="submit" className="mp-button">{c("Review request", "ตรวจสอบคำขอ")}</button>
          </div>
        </form>
      )}
    </PreviewDialog>
  );
}

function HelpDialog({
  booking,
  language,
  profileName,
  profileEmail,
  onClose,
  onNotify,
}: {
  booking: BookingRecord;
  language: PreviewLanguage;
  profileName: string;
  profileEmail: string;
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const c = copyFor(language);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    onNotify(c("Example help request saved locally; no message was sent.", "บันทึกคำขอความช่วยเหลือตัวอย่างไว้ในหน้านี้แล้ว ไม่ได้ส่งข้อความจริง"));
  };

  return (
    <PreviewDialog
      title={c("Request help · example form", "ขอความช่วยเหลือ · แบบฟอร์มตัวอย่าง")}
      description={c(`Example support for ${booking.id}; this does not send a real message.`, `ตัวอย่างการติดต่อสำหรับ ${booking.id} ไม่ได้ส่งข้อความจริง`)}
      onClose={onClose}
    >
      {sent ? (
        <div className="space-y-4">
          <PreviewNote>
            {c("Saved locally for this preview only. The support team was not contacted.", "บันทึกไว้เฉพาะในตัวอย่างนี้ ทีมช่วยเหลือไม่ได้รับการติดต่อ")}
          </PreviewNote>
          <div className="mp-actions">
            <button type="button" className="mp-button" onClick={onClose}>{c("Close", "ปิด")}</button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="mp-form-grid">
            <label className="mp-field">
              <span>{c("Name", "ชื่อ")}</span>
              <input className="mp-filter" defaultValue={profileName} />
            </label>
            <label className="mp-field">
              <span>{c("Email", "อีเมล")}</span>
              <input className="mp-filter" type="email" defaultValue={profileEmail} />
            </label>
          </div>
          <label className="mp-field">
            <span>{c("Example message", "ข้อความตัวอย่าง")}</span>
            <textarea className="mp-filter" rows={4} defaultValue={c(`Please help with booking ${booking.id}.`, `ขอความช่วยเหลือเกี่ยวกับการจอง ${booking.id}`)} />
          </label>
          <PreviewNote>
            {c("No real message, email, or support ticket will be created.", "จะไม่มีการส่งข้อความ อีเมล หรือสร้างทิกเก็ตจริง")}
          </PreviewNote>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={onClose}>{c("Cancel", "ยกเลิก")}</button>
            <button type="submit" className="mp-button">{c("Save example", "บันทึกตัวอย่าง")}</button>
          </div>
        </form>
      )}
    </PreviewDialog>
  );
}

function TopUpDialog({
  language,
  tier,
  onClose,
  onNotify,
}: {
  language: PreviewLanguage;
  tier: MemberPageProps["tier"];
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const c = copyFor(language);
  const availableCurrencies = tier === "VVIP" ? [...fiatCurrencies, "USDT", "BTC", "ETH", "BNB"] as BalanceCurrency[] : fiatCurrencies;
  const [amount, setAmount] = useState("2500");
  const [currency, setCurrency] = useState<BalanceCurrency>("THB");
  const [channel, setChannel] = useState("Bank transfer · demo");
  const [reviewing, setReviewing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewing(true);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    onNotify(c("Sample top-up request reviewed; balance is unchanged.", "ตรวจสอบคำขอเติมเงินตัวอย่างแล้ว ยอดคงเหลือยังไม่เปลี่ยนแปลง"));
  };

  return (
    <PreviewDialog
      title={c("Top up · simulated step", "เติมเงิน · ขั้นตอนจำลอง")}
      description={c("Choose a sample amount and channel, then review. No payment request will be sent.", "เลือกจำนวนเงินและช่องทางตัวอย่าง แล้วตรวจสอบ ไม่มีการส่งคำขอชำระเงินจริง")}
      onClose={onClose}
    >
      {confirmed ? (
        <div className="space-y-4">
          <div className="mp-note">
            <CheckCircle2 size={17} aria-hidden="true" />
            <p>
              {c("Sample request acknowledged. No money was credited and no real transaction occurred.", "รับทราบคำขอตัวอย่างแล้ว ไม่มีการเพิ่มเงินและไม่มีธุรกรรมจริงเกิดขึ้น")}
            </p>
          </div>
          <div className="mp-actions">
            <button type="button" className="mp-button" onClick={onClose}>{c("Done", "เสร็จสิ้น")}</button>
          </div>
        </div>
      ) : reviewing ? (
        <div className="space-y-5">
          <div className="mp-detail-grid">
            <DetailField label={c("Sample amount", "จำนวนเงินตัวอย่าง")}>{formatDemoAmount(Number(amount) || 0, currency)}</DetailField>
            <DetailField label={c("Currency channel", "ช่องทางสกุลเงิน")}>{currencyLabels[currency]}</DetailField>
            <DetailField label={c("Payment channel", "ช่องทางชำระเงิน")}>{channel}</DetailField>
            <DetailField label={c("Account effect", "ผลต่อบัญชี")}>{c("No credit · demo only", "ไม่เพิ่มยอด · ตัวอย่างเท่านั้น")}</DetailField>
          </div>
          <PreviewNote>
            {c("This is a review step only. No account number, card number, wallet address, payment request, or transaction is created.", "นี่เป็นเพียงขั้นตอนตรวจสอบ จะไม่มีการสร้างเลขบัญชี เลขบัตร ที่อยู่กระเป๋า คำขอชำระเงิน หรือธุรกรรม")}
          </PreviewNote>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={() => setReviewing(false)}>{c("Back", "ย้อนกลับ")}</button>
            <button type="button" className="mp-button" onClick={handleConfirm}>{c("Acknowledge sample", "รับทราบตัวอย่าง")}</button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleReview}>
          <div className="mp-form-grid">
            <label className="mp-field">
              <span>{c("Amount", "จำนวนเงิน")}</span>
              <input className="mp-filter" type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
            </label>
            <label className="mp-field">
              <span>{c("Currency", "สกุลเงิน")}</span>
              <select className="mp-filter" value={currency} onChange={(event) => setCurrency(event.target.value as BalanceCurrency)}>
                {availableCurrencies.map((item) => <option key={item} value={item}>{item} · {currencyLabels[item]}</option>)}
              </select>
            </label>
          </div>
          <label className="mp-field">
            <span>{c("Sample channel", "ช่องทางตัวอย่าง")}</span>
            <select className="mp-filter" value={channel} onChange={(event) => setChannel(event.target.value)}>
              <option>Bank transfer · demo</option>
              <option>Card channel · demo</option>
              {tier === "VVIP" && <option>Crypto channel · demo</option>}
            </select>
          </label>
          <PreviewNote>
            {c("Demo only: no account or card number upload, no payment request, and no automatic withdrawal or refund. Refunds are Admin-only.", "ตัวอย่างเท่านั้น: ไม่มีการอัปโหลดเลขบัญชีหรือเลขบัตร ไม่มีคำขอชำระเงิน และไม่มีการถอนหรือคืนเงินอัตโนมัติ การคืนเงินทำโดย Admin เท่านั้น")}
          </PreviewNote>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={onClose}>{c("Cancel", "ยกเลิก")}</button>
            <button type="submit" className="mp-button">{c("Review", "ตรวจสอบ")}</button>
          </div>
        </form>
      )}
    </PreviewDialog>
  );
}

function BookingsPage({ props }: { props: MemberPageProps }) {
  const { language, notify } = props;
  const c = copyFor(language);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [tripOpen, setTripOpen] = useState(false);

  const visibleBookings = useMemo(() => {
    const today = new Date();
    return bookings.filter((booking) => {
      if (filter === "all") return true;
      const isPast = new Date(`${booking.date}T23:59:59`).getTime() < today.getTime();
      return filter === "past" ? isPast : !isPast;
    });
  }, [filter]);

  const filterLabels: Record<BookingFilter, string> = {
    all: c("All", "ทั้งหมด"),
    upcoming: c("Upcoming", "กำลังจะมาถึง"),
    past: c("Past", "ที่ผ่านมาแล้ว"),
  };

  return (
    <>
      <PageHeading
        eyebrow={c("Shuttle · My Bookings", "Shuttle · การจองของฉัน")}
        title={c("Private rides, clearly arranged", "รถเหมาคันที่จัดการได้อย่างชัดเจน")}
        description={c("Review your sample whole-vehicle requests and their manual admin status.", "ตรวจสอบคำขอรถเหมาคันตัวอย่างและสถานะการจัดรถโดย Admin")}
        action={(
          <button type="button" className="mp-button" onClick={() => setTripOpen(true)}>
            <Plus size={17} aria-hidden="true" />
            {c("New booking", "จองใหม่")}
          </button>
        )}
      />

      <PreviewNote>
        {c("Shuttle is private whole-vehicle service, not shared seats. Prices below are fixed sample zone prices in THB. Admin manually assigns the vehicle and driver; there is no automatic matching or instant confirmation.", "Shuttle เป็นบริการรถเหมาคัน ไม่ใช่ที่นั่งร่วม ราคาด้านล่างเป็นราคาตัวอย่างคงที่ตามโซนเป็น THB โดย Admin จะเลือกรถและคนขับเอง ไม่มีการจับคู่อัตโนมัติหรือยืนยันทันที")}
      </PreviewNote>

      <Panel
        title={c("My bookings", "การจองของฉัน")}
        description={c(`${visibleBookings.length} sample booking${visibleBookings.length === 1 ? "" : "s"} shown`, `แสดงการจองตัวอย่าง ${visibleBookings.length} รายการ`)}
        action={(
          <div className="mp-filter-row" aria-label={c("Booking filters", "ตัวกรองการจอง")}>
            {(Object.keys(filterLabels) as BookingFilter[]).map((item) => (
              <button key={item} type="button" className={`mp-filter ${filter === item ? "is-active" : ""}`} aria-pressed={filter === item} onClick={() => setFilter(item)}>
                {filterLabels[item]}
              </button>
            ))}
          </div>
        )}
      >
        {visibleBookings.length === 0 ? (
          <EmptyState title={c("No sample bookings here", "ไม่มีการจองตัวอย่างในส่วนนี้")} description={c("Try another local filter.", "ลองเลือกตัวกรองอื่นในหน้านี้")} />
        ) : (
          <div className="mp-booking-list">
            {visibleBookings.map((booking) => (
              <article className="mp-booking-row" key={booking.id}>
                <div className="mp-booking-route">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} aria-hidden="true" />
                    <div>
                      <p className="font-semibold">{booking.pickup}</p>
                      <p className="mp-description">{c("to", "ไปยัง")} {booking.dropoff}</p>
                    </div>
                  </div>
                  <p className="mp-text-link">{booking.zone} · {c("fixed sample zone price", "ราคาตัวอย่างคงที่ตามโซน")}</p>
                </div>
                <div className="mp-booking-meta">
                  <div className="flex flex-wrap items-center gap-2">
                    <BookingStatusLabel booking={booking} language={language} />
                    <span className="text-sm text-muted-foreground">{booking.id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} aria-hidden="true" />{formatDate(booking.date, language)}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden="true" />{booking.time}</span>
                    <span className="inline-flex items-center gap-1.5">{vehicleIcon(booking.vehicle)}{booking.vehicle} · {booking.pax} {c("pax", "คน")}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="mp-amount">{money(booking.amount, booking.currency)}</span>
                    <Link className="mp-text-link" to={memberUrl(`shuttle/booking/${booking.id}`)}>{c("View detail", "ดูรายละเอียด")} <span aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={c("Need a different route?", "ต้องการเส้นทางอื่นหรือไม่") } description={c("Open a local preview request without leaving the member workspace.", "เปิดคำขอตัวอย่างในพื้นที่สมาชิกโดยไม่ออกจากหน้านี้") }>
        <div className="mp-actions">
          <button type="button" className="mp-button mp-button-secondary" onClick={() => setTripOpen(true)}><Plus size={16} aria-hidden="true" />{c("Preview a trip request", "ดูตัวอย่างคำขอเดินทาง")}</button>
          <LinkButton to="shuttle/balance" secondary>{c("View advance balance", "ดูยอดฝากล่วงหน้า")}</LinkButton>
        </div>
      </Panel>

      {tripOpen && <TripRequestDialog language={language} onClose={() => setTripOpen(false)} onNotify={notify} />}
    </>
  );
}

function BookingDetailPage({ props, bookingId }: { props: MemberPageProps; bookingId: string }) {
  const { language, profile, notify } = props;
  const c = copyFor(language);
  const [helpOpen, setHelpOpen] = useState(false);
  const booking = bookings.find((item) => item.id === bookingId);

  if (!booking) {
    return (
      <>
        <PageHeading eyebrow={c("Shuttle · Booking detail", "Shuttle · รายละเอียดการจอง")} title={c("Booking not found", "ไม่พบการจอง")} description={c("This preview only includes its three fictitious sample records.", "ตัวอย่างนี้มีเฉพาะรายการจำลอง 3 รายการ")}/>
        <EmptyState title={c("No matching sample record", "ไม่พบรายการตัวอย่างที่ตรงกัน")} description={c("Return to My Bookings to choose a working detail link.", "กลับไปที่การจองของฉันเพื่อเลือกลิงก์รายละเอียดที่ใช้งานได้")}>
          <LinkButton to="shuttle/bookings" secondary><ArrowLeft size={16} aria-hidden="true" />{c("Back to My Bookings", "กลับไปการจองของฉัน")}</LinkButton>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow={c("Shuttle · Booking detail", "Shuttle · รายละเอียดการจอง")}
        title={booking.id}
        description={c("A private whole-vehicle request with fixed sample zone pricing.", "คำขอรถเหมาคันพร้อมราคาตัวอย่างคงที่ตามโซน")}
        action={<LinkButton to="shuttle/bookings" secondary><ArrowLeft size={16} aria-hidden="true" />{c("Back to bookings", "กลับไปการจอง")}</LinkButton>}
      />

      <div className="mp-actions">
        <BookingStatusLabel booking={booking} language={language} />
        <span className="text-sm text-muted-foreground">{c("Demo record · no live booking", "รายการสาธิต · ไม่ใช่การจองจริง")}</span>
      </div>

      {booking.status === "pending" ? (
        <PreviewNote>
          {c("Not assigned yet. Admin will manually assign the vehicle and driver after review. There is no automatic matching or instant confirmation.", "ยังไม่ได้จัดรถ Admin จะเลือกรถและคนขับด้วยตนเองหลังตรวจสอบ ไม่มีการจับคู่อัตโนมัติหรือยืนยันทันที")}
        </PreviewNote>
      ) : booking.status === "confirmed" ? (
        <PreviewNote>
          {c("Confirmed in this sample after manual admin assignment. It is not a live dispatch.", "ยืนยันแล้วในตัวอย่างนี้หลัง Admin จัดรถด้วยตนเอง ไม่ใช่การจัดรถจริง")}
        </PreviewNote>
      ) : (
        <PreviewNote>
          {c("Completed sample record. Any refund or exception would be handled by Admin; no automatic refund is shown here.", "รายการตัวอย่างที่เสร็จสิ้นแล้ว การคืนเงินหรือข้อยกเว้นใด ๆ ต้องดำเนินการโดย Admin ไม่มีการคืนเงินอัตโนมัติในหน้านี้")}
        </PreviewNote>
      )}

      <Panel title={c("Ride details", "รายละเอียดการเดินทาง")} description={c("Sample values are shown for review only.", "แสดงค่าตัวอย่างเพื่อการตรวจสอบเท่านั้น")}>
        <dl className="mp-detail-grid">
          <DetailField icon={<MapPin size={15} aria-hidden="true" />} label={c("Pickup", "จุดรับ")}>{booking.pickup}</DetailField>
          <DetailField icon={<MapPin size={15} aria-hidden="true" />} label={c("Drop-off", "จุดส่ง")}>{booking.dropoff}</DetailField>
          <DetailField icon={<CalendarDays size={15} aria-hidden="true" />} label={c("Date", "วันที่")}>{formatDate(booking.date, language)}</DetailField>
          <DetailField icon={<Clock3 size={15} aria-hidden="true" />} label={c("Time", "เวลา")}>{booking.time}</DetailField>
          <DetailField icon={vehicleIcon(booking.vehicle)} label={c("Vehicle", "รถ")}>{booking.vehicle}</DetailField>
          <DetailField icon={<Users size={15} aria-hidden="true" />} label={c("Passengers", "ผู้โดยสาร")}>{booking.pax} {c("people", "คน")}</DetailField>
          <DetailField icon={<CircleDollarSign size={15} aria-hidden="true" />} label={c("Fixed sample amount", "ยอดตัวอย่างคงที่")}>{money(booking.amount, booking.currency)}</DetailField>
          <DetailField icon={<ShieldCheck size={15} aria-hidden="true" />} label={c("Pricing basis", "หลักราคา")}>{booking.zone} · {c("whole vehicle", "เหมาคัน")}</DetailField>
        </dl>
      </Panel>

      <Panel title={c("Need help with this sample?", "ต้องการความช่วยเหลือเกี่ยวกับตัวอย่างนี้หรือไม่")} description={c("Open an example form; it will not send a real message.", "เปิดแบบฟอร์มตัวอย่าง โดยจะไม่ส่งข้อความจริง")}>
        <div className="mp-actions">
          <button type="button" className="mp-button mp-button-secondary" onClick={() => setHelpOpen(true)}><MessageCircleQuestion size={17} aria-hidden="true" />{c("Request help", "ขอความช่วยเหลือ")}</button>
          <LinkButton to="shuttle/bookings" secondary><ArrowLeft size={16} aria-hidden="true" />{c("Back to My Bookings", "กลับไปการจองของฉัน")}</LinkButton>
        </div>
      </Panel>

      {helpOpen && <HelpDialog booking={booking} language={language} profileName={profile.name} profileEmail={profile.email} onClose={() => setHelpOpen(false)} onNotify={notify} />}
    </>
  );
}

function BalancePage({ props }: { props: MemberPageProps }) {
  const { language, tier, notify } = props;
  const c = copyFor(language);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const balances = tier === "VVIP" ? vvipBalances : vipBalances;
  const supportedCurrencies = tier === "VVIP" ? Object.keys(vvipBalances) as BalanceCurrency[] : fiatCurrencies;
  const history = tier === "VVIP" ? [
    { date: "2026-10-22", label: c("Demo sample balance", "ยอดตัวอย่างสาธิต"), amount: "+ 12", currency: "USDT" as BalanceCurrency },
    { date: "2026-10-09", label: c("Sample Shuttle reservation", "การจอง Shuttle ตัวอย่าง"), amount: "− 1,800", currency: "THB" as BalanceCurrency },
    { date: "2026-09-28", label: c("Demo sample balance", "ยอดตัวอย่างสาธิต"), amount: "+ 0.02", currency: "BTC" as BalanceCurrency },
  ] : [
    { date: "2026-10-20", label: c("Demo sample balance", "ยอดตัวอย่างสาธิต"), amount: "+ 5,000", currency: "THB" as BalanceCurrency },
    { date: "2026-10-05", label: c("Sample Shuttle reservation", "การจอง Shuttle ตัวอย่าง"), amount: "− 1,800", currency: "THB" as BalanceCurrency },
    { date: "2026-09-12", label: c("Demo sample balance", "ยอดตัวอย่างสาธิต"), amount: "+ 200", currency: "USD" as BalanceCurrency },
  ];

  if (tier === "General") {
    return (
      <>
        <PageHeading eyebrow={c("Shuttle · Advance Balance", "Shuttle · ยอดฝากล่วงหน้า")} title={c("Pay per booking", "ชำระเป็นรายจอง")} description={c("General members use Shuttle with THB payment per booking; no seeded wallet balance is shown.", "สมาชิก General ใช้ Shuttle โดยชำระเป็น THB ต่อการจอง ไม่มีการแสดงยอดกระเป๋าเงินตั้งต้น")} />
        <PreviewNote>{c("No wallet is created for this tier. Each private whole-vehicle request uses a sample fixed zone price in THB and remains subject to Admin review.", "ไม่มีการสร้างกระเป๋าเงินสำหรับระดับนี้ คำขอรถเหมาคันแต่ละรายการใช้ราคาตัวอย่างคงที่ตามโซนเป็น THB และต้องรอ Admin ตรวจสอบ")}</PreviewNote>
        <Panel title={c("THB booking payment", "การชำระค่าจองเป็น THB")} description={c("A simple pay-per-booking explanation for the General tier.", "คำอธิบายการชำระต่อการจองสำหรับระดับ General") }>
          <div className="mp-detail-grid">
            <DetailField icon={<Banknote size={16} aria-hidden="true" />} label={c("Payment currency", "สกุลเงินชำระ")}>THB</DetailField>
            <DetailField icon={<CarFront size={16} aria-hidden="true" />} label={c("Service", "บริการ")}>{c("Private whole vehicle", "รถเหมาคัน")}</DetailField>
            <DetailField icon={<ShieldCheck size={16} aria-hidden="true" />} label={c("Confirmation", "การยืนยัน")}>{c("Admin review", "Admin ตรวจสอบ")}</DetailField>
            <DetailField icon={<CircleDollarSign size={16} aria-hidden="true" />} label={c("Pricing", "ราคา")}>{c("Fixed sample zone price", "ราคาตัวอย่างคงที่ตามโซน")}</DetailField>
          </div>
          <div className="mp-actions">
            <LinkButton to="shuttle/bookings">{c("View sample bookings", "ดูการจองตัวอย่าง")}</LinkButton>
          </div>
        </Panel>
      </>
    );
  }

  if (tier === "Business Partner") {
    return (
      <>
        <PageHeading eyebrow={c("Shuttle · Advance Balance", "Shuttle · ยอดฝากล่วงหน้า")} title={c("Organization payment workspace", "พื้นที่ชำระเงินขององค์กร")} description={c("Business Partner reporting is available; this preview does not invent a credit limit, SLA, or seeded wallet.", "Business Partner ใช้รายงานได้ ตัวอย่างนี้ไม่กำหนดวงเงินเครดิต SLA หรือยอดกระเป๋าเงินขึ้นเอง")} />
        <PreviewNote>{c("Business Partner payment terms and any organization arrangement are handled outside this preview. No automatic withdrawal or refund is available; refunds are Admin-only.", "เงื่อนไขชำระเงินและข้อตกลงขององค์กรอยู่นอกตัวอย่างนี้ ไม่มีการถอนหรือคืนเงินอัตโนมัติ การคืนเงินทำโดย Admin เท่านั้น")}</PreviewNote>
        <Panel title={c("Reports for your organization", "รายงานสำหรับองค์กร")} description={c("Open a local organization demo without live data.", "เปิดตัวอย่างข้อมูลองค์กรในหน้านี้โดยไม่มีข้อมูลจริง")}>
          <div className="mp-actions">
            <LinkButton to="shuttle/reports">{c("Open Business Reports", "เปิดรายงานธุรกิจ")}</LinkButton>
            <LinkButton to="membership" secondary>{c("Review membership", "ดูข้อมูลสมาชิก")}</LinkButton>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow={c("Shuttle · Advance Balance", "Shuttle · ยอดฝากล่วงหน้า")}
        title={c("Separate demo balances by currency", "ยอดตัวอย่างแยกตามสกุลเงิน")}
        description={c(`${tier} prepaid balance preview with sample history.`, `ตัวอย่างยอดฝากล่วงหน้าสำหรับ ${tier} พร้อมประวัติตัวอย่าง`)}
        action={(
          <button type="button" className="mp-button" onClick={() => setTopUpOpen(true)}><Plus size={17} aria-hidden="true" />{c("Top up · demo", "เติมเงิน · ตัวอย่าง")}</button>
        )}
      />
      <PreviewNote>
        {tier === "VVIP"
          ? c("Each fiat currency and crypto asset is shown separately; these figures are demo balances, not FX-converted equivalents. VVIP crypto channels: USDT, BTC, ETH and BNB.", "แต่ละสกุลเงินและสินทรัพย์คริปโตแสดงแยกกัน ยอดเหล่านี้เป็นยอดตัวอย่าง ไม่ใช่การแปลงค่าเงิน VVIP รองรับ USDT, BTC, ETH และ BNB")
          : c("Each fiat currency is shown separately; these figures are demo balances, not FX-converted equivalents. VIP channels: THB, USD, EUR, GBP, JPY and CNY.", "แต่ละสกุลเงินแสดงแยกกัน ยอดเหล่านี้เป็นยอดตัวอย่าง ไม่ใช่การแปลงค่าเงิน VIP รองรับ THB, USD, EUR, GBP, JPY และ CNY")}
      </PreviewNote>
      <Panel title={c("Demo balance snapshot", "ภาพรวมยอดตัวอย่าง")} description={c("A separate sample figure is provided for every supported currency.", "แสดงยอดตัวอย่างแยกสำหรับทุกสกุลเงินที่รองรับ")}>
        <div className="mp-summary-strip">
          {supportedCurrencies.map((currency) => (
            <div key={currency}>
              <p className="text-sm text-muted-foreground">{currency}</p>
              <p className="mp-amount">{formatDemoAmount(balances[currency] ?? 0, currency)}</p>
              <p className="text-xs text-muted-foreground">{c("demo sample balance", "ยอดตัวอย่างสาธิต")}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title={c("Sample balance history", "ประวัติยอดตัวอย่าง")} description={c("Ledger examples are local and do not move money.", "ตัวอย่างบัญชีรายการอยู่ในหน้านี้และไม่มีการโอนเงินจริง")}>
        <div className="space-y-1">
          {history.map((item) => (
            <div className="mp-list-row" key={`${item.date}-${item.currency}-${item.amount}`}>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{formatDate(item.date, language)}</p>
              </div>
              <span className="font-semibold">{item.amount} {item.currency}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title={c("Account safeguards", "การคุ้มครองบัญชี")}>
        <div className="mp-note">
          <ShieldCheck size={17} aria-hidden="true" />
          <p>{c("No automatic withdrawal. Any refund or exception is handled by Admin only.", "ไม่มีการถอนเงินอัตโนมัติ การคืนเงินหรือข้อยกเว้นดำเนินการโดย Admin เท่านั้น")}</p>
        </div>
      </Panel>
      {topUpOpen && <TopUpDialog language={language} tier={tier} onClose={() => setTopUpOpen(false)} onNotify={notify} />}
    </>
  );
}

function ReportsPage({ props }: { props: MemberPageProps }) {
  const { language, tier } = props;
  const c = copyFor(language);
  const [range, setRange] = useState<ReportRange>("all");

  if (tier !== "Business Partner") {
    return (
      <>
        <PageHeading eyebrow={c("Shuttle · Business Reports", "Shuttle · รายงานธุรกิจ")} title={c("Reports are not applicable", "รายงานไม่เกี่ยวข้องกับระดับนี้")} description={c("Business Reports are a Business Partner workspace for organizations.", "Business Reports เป็นพื้นที่สำหรับองค์กรระดับ Business Partner")} />
        <EmptyState title={c("Business Partner only", "สำหรับ Business Partner เท่านั้น")} description={c("This tier has no organization report dataset in the preview. Review membership or return to Shuttle bookings.", "ระดับนี้ไม่มีชุดข้อมูลรายงานองค์กรในตัวอย่าง ดูข้อมูลสมาชิกหรือกลับไปการจอง Shuttle")}>
          <div className="mp-actions">
            <LinkButton to="membership">{c("Review membership", "ดูข้อมูลสมาชิก")}</LinkButton>
            <LinkButton to="shuttle/bookings" secondary>{c("Back to bookings", "กลับไปการจอง")}</LinkButton>
          </div>
        </EmptyState>
      </>
    );
  }

  const reportBookings = bookings.filter((booking) => {
    if (range === "all") return true;
    return range === "october" ? booking.date.startsWith("2026-10") : booking.date.startsWith("2026-11");
  });
  const reportRangeLabels: Record<ReportRange, string> = {
    all: c("All demo records", "รายการตัวอย่างทั้งหมด"),
    october: c("October 2026", "ตุลาคม 2026"),
    november: c("November 2026", "พฤศจิกายน 2026"),
  };

  return (
    <>
      <PageHeading eyebrow={c("Shuttle · Business Reports", "Shuttle · รายงานธุรกิจ")} title={c("Organization demo overview", "ภาพรวมตัวอย่างขององค์กร")} description={c("A small local report for Business Partner review; no live organization data is connected.", "รายงานตัวอย่างขนาดเล็กสำหรับ Business Partner ไม่มีการเชื่อมต่อข้อมูลองค์กรจริง")} action={<LinkButton to="shuttle/bookings" secondary>{c("My bookings", "การจองของฉัน")}</LinkButton>} />
      <PreviewNote>{c("The date selector changes the subset of these three fictitious sample bookings. There is no export, download, or live report feed in this preview.", "ตัวเลือกวันที่จะเปลี่ยนชุดข้อมูลจากการจองตัวอย่างจำลอง 3 รายการ ไม่มีการส่งออก ดาวน์โหลด หรือฟีดรายงานจริงในตัวอย่างนี้")}</PreviewNote>
      <Panel
        title={c("Demo report period", "ช่วงเวลารายงานตัวอย่าง")}
        action={(
          <label className="mp-field">
            <span className="sr-only">{c("Date range", "ช่วงวันที่")}</span>
            <select className="mp-filter" value={range} onChange={(event) => setRange(event.target.value as ReportRange)}>
              {(Object.keys(reportRangeLabels) as ReportRange[]).map((item) => <option key={item} value={item}>{reportRangeLabels[item]}</option>)}
            </select>
          </label>
        )}
      >
        <div className="mp-summary-strip">
          <div><p className="text-sm text-muted-foreground">{c("Demo bookings", "การจองตัวอย่าง")}</p><p className="mp-amount">{reportBookings.length}</p></div>
          <div><p className="text-sm text-muted-foreground">{c("Whole vehicles", "รถเหมาคัน")}</p><p className="mp-amount">{reportBookings.length}</p></div>
          <div><p className="text-sm text-muted-foreground">{c("Sample value", "มูลค่าตัวอย่าง")}</p><p className="mp-amount">{money(reportBookings.reduce((sum, item) => sum + item.amount, 0), "THB")}</p></div>
        </div>
      </Panel>
      <Panel title={c("Sample booking rows", "รายการจองตัวอย่าง")} description={c("Every row is a fictitious whole-vehicle request.", "ทุกรายการเป็นคำขอรถเหมาคันจำลอง") }>
        {reportBookings.length === 0 ? (
          <EmptyState title={c("No demo rows in this period", "ไม่มีรายการตัวอย่างในช่วงนี้")} description={c("Choose another date selector value.", "เลือกช่วงเวลาอื่น")}/>
        ) : (
          <div className="space-y-1">
            {reportBookings.map((booking) => (
              <div className="mp-list-row" key={booking.id}>
                <div>
                  <p className="font-medium">{booking.id} · {booking.pickup} {c("to", "ไปยัง")} {booking.dropoff}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(booking.date, language)} · {booking.vehicle} · {booking.pax} {c("pax", "คน")} · {booking.zone}</p>
                </div>
                <div className="text-right">
                  <BookingStatusLabel booking={booking} language={language} />
                  <p className="mt-1 font-semibold">{money(booking.amount, booking.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Panel title={c("Report boundaries", "ขอบเขตของรายงาน")}>
        <div className="mp-note">
          <FileText size={17} aria-hidden="true" />
          <p>{c("This organization view is a local demo only. It does not create invoices, credit limits, service-level promises, or payment actions.", "มุมมององค์กรนี้เป็นตัวอย่างในหน้านี้เท่านั้น ไม่ได้สร้างใบแจ้งหนี้ วงเงินเครดิต คำมั่น SLA หรือการดำเนินการชำระเงิน")}</p>
        </div>
      </Panel>
    </>
  );
}

export default function ShuttlePages(props: MemberPageProps) {
  const page = props.page.replace(/^\/+|\/+$/g, "");
  const detailId = props.page.split("/").pop() || "";

  if (page === "shuttle/bookings") return <BookingsPage props={props} />;
  if (page === "shuttle/balance") return <BalancePage props={props} />;
  if (page === "shuttle/reports") return <ReportsPage props={props} />;
  if (page.startsWith("shuttle/booking/")) return <BookingDetailPage props={props} bookingId={detailId} />;

  const c = copyFor(props.language);
  return (
    <EmptyState title={c("Shuttle page not found", "ไม่พบหน้า Shuttle")} description={c("Choose My Bookings, Advance Balance, or Business Reports from the member navigation.", "เลือกการจองของฉัน ยอดฝากล่วงหน้า หรือรายงานธุรกิจจากเมนูสมาชิก")}>
      <LinkButton to="shuttle/bookings">{c("Open My Bookings", "เปิดการจองของฉัน")}</LinkButton>
    </EmptyState>
  );
}
