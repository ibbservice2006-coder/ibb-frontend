import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
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
import BalancePaymentPreview from "@/components/balance-preview/BalancePaymentPreview";
import {
  EmptyState,
  LinkButton,
  PageHeading,
  Panel,
  PreviewDialog,
  Status,
  copyFor,
  memberUrl,
  money,
} from "./ui";
import type { MemberPageProps, PreviewLanguage } from "./ui";

type BookingStatus = "pending" | "confirmed" | "completed";
type BookingFilter = "all" | "upcoming" | "past";
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
    id: "IBB-001",
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
    id: "IBB-002",
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
    id: "IBB-003",
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

function bookingsForAccount(email: string): BookingRecord[] {
  const key = email.trim().toLowerCase();
  if (key === "alex@example.com") return bookings;
  if (key === "jamie@example.com") return [{ ...bookings[2], id: "IBB-J003" }];
  if (key === "company@example.com") return bookings.map((booking, index) => ({ ...booking, id: `IBB-C00${index + 1}` }));
  return [{ ...bookings[0], id: "IBB-G001" }];
}

const statusText = (status: BookingStatus, language: PreviewLanguage) => {
  const c = copyFor(language);
  if (status === "pending") return c("Pending assignment", "รอจัดรถ");
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
    onNotify(c("Request received. Our team will review the trip details.", "ได้รับคำขอแล้ว ทีมงานจะตรวจสอบรายละเอียดการเดินทาง"));
  };

  return (
    <PreviewDialog
      title={c("New trip request", "คำขอเดินทางใหม่")}
      description={c("Tell us where and when you need a private vehicle.", "ระบุสถานที่และเวลาที่ต้องการรถเหมาคัน")}
      onClose={onClose}
    >
      {submitted ? (
        <div className="space-y-4">
          <div className="mp-note">
            <CheckCircle2 size={17} aria-hidden="true" />
            <p>
              <strong>{c("Request received", "ได้รับคำขอแล้ว")}</strong>{" "}
              {c("Our team will review the details and assign a vehicle and driver.", "ทีมงานจะตรวจสอบรายละเอียดและจัดรถพร้อมคนขับให้")}
            </p>
          </div>
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
          <div className="mp-note">
            <p>{c("Private whole-vehicle service · Zone A · THB 1,800", "บริการรถเหมาคัน · โซน A · 1,800 บาท")}</p>
          </div>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={() => setReviewing(false)}>{c("Back", "ย้อนกลับ")}</button>
            <button type="button" className="mp-button" onClick={handleSubmit}>{c("Send request", "ส่งคำขอ")}</button>
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
          <div className="mp-note">
            <p>{c("Private whole-vehicle service with fixed zone pricing.", "บริการรถเหมาคันพร้อมราคาคงที่ตามโซน")}</p>
          </div>
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
    onNotify(c("Help request received. Our team will get back to you.", "ได้รับคำขอความช่วยเหลือแล้ว ทีมงานจะติดต่อกลับ"));
  };

  return (
    <PreviewDialog
      title={c("Request help", "ขอความช่วยเหลือ")}
      description={c(`Contact our team about booking ${booking.id}.`, `ติดต่อทีมงานเกี่ยวกับการจอง ${booking.id}`)}
      onClose={onClose}
    >
      {sent ? (
        <div className="space-y-4">
          <div className="mp-note">
            <CheckCircle2 size={17} aria-hidden="true" />
            <p>{c("We’ve received your request. Our team will get back to you.", "ได้รับคำขอของคุณแล้ว ทีมงานจะติดต่อกลับ")}</p>
          </div>
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
            <span>{c("Message", "ข้อความ")}</span>
            <textarea className="mp-filter" rows={4} defaultValue={c(`Please help with booking ${booking.id}.`, `ขอความช่วยเหลือเกี่ยวกับการจอง ${booking.id}`)} />
          </label>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={onClose}>{c("Cancel", "ยกเลิก")}</button>
            <button type="submit" className="mp-button">{c("Send request", "ส่งคำขอ")}</button>
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
    return bookingsForAccount(props.accountKey).filter((booking) => {
      if (filter === "all") return true;
      const isPast = new Date(`${booking.date}T23:59:59`).getTime() < today.getTime();
      return filter === "past" ? isPast : !isPast;
    });
  }, [filter, props.accountKey]);

  const filterLabels: Record<BookingFilter, string> = {
    all: c("All", "ทั้งหมด"),
    upcoming: c("Upcoming", "กำลังจะมาถึง"),
    past: c("Past", "ที่ผ่านมาแล้ว"),
  };

  return (
    <>
      <PageHeading
        eyebrow={c("Shuttle · My Bookings", "Shuttle · การจองของฉัน")}
        title={c("My bookings", "การจองของฉัน")}
        description={c("Manage your Shuttle trips, request a new vehicle, and follow each booking status.", "จัดการการเดินทาง Shuttle ขอรถคันใหม่ และติดตามสถานะการจอง")}
        action={(
          <button type="button" className="mp-button" onClick={() => setTripOpen(true)}>
            <Plus size={17} aria-hidden="true" />
            {c("New booking", "จองใหม่")}
          </button>
        )}
      />

      <Panel
        title={c("My bookings", "การจองของฉัน")}
        description={c(`${visibleBookings.length} booking${visibleBookings.length === 1 ? "" : "s"}`, `มีการจอง ${visibleBookings.length} รายการ`)}
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
          <EmptyState title={c("No bookings here", "ไม่มีการจองในส่วนนี้")} description={c("Try another filter.", "ลองเลือกตัวกรองอื่น")} />
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
                  <p className="mp-text-link">{booking.zone} · {c("Fixed zone price", "ราคาคงที่ตามโซน")}</p>
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

      {tripOpen && <TripRequestDialog language={language} onClose={() => setTripOpen(false)} onNotify={notify} />}
    </>
  );
}

function BookingDetailPage({ props, bookingId }: { props: MemberPageProps; bookingId: string }) {
  const { language, profile, notify } = props;
  const c = copyFor(language);
  const [helpOpen, setHelpOpen] = useState(false);
  const booking = bookingsForAccount(props.accountKey).find((item) => item.id === bookingId);

  if (!booking) {
    return (
      <>
        <PageHeading eyebrow={c("Shuttle · Booking detail", "Shuttle · รายละเอียดการจอง")} title={c("Booking not found", "ไม่พบการจอง")} description={c("Check the booking link or return to My Bookings.", "ตรวจสอบลิงก์การจองหรือกลับไปที่การจองของฉัน")} />
        <EmptyState title={c("No matching booking", "ไม่พบการจองที่ตรงกัน")} description={c("Return to My Bookings to choose a booking.", "กลับไปที่การจองของฉันเพื่อเลือกรายการ") }>
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
        description={c("Private whole-vehicle service with pricing based on the pickup and drop-off zone.", "บริการรถเหมาคันพร้อมราคาตามโซนจุดรับและจุดส่ง")}
        action={<LinkButton to="shuttle/bookings" secondary><ArrowLeft size={16} aria-hidden="true" />{c("Back to bookings", "กลับไปการจอง")}</LinkButton>}
      />

      <div className="mp-actions">
        <BookingStatusLabel booking={booking} language={language} />
      </div>

      <div className="mp-note">
        <CheckCircle2 size={17} aria-hidden="true" />
        <p>
          {booking.status === "pending"
            ? c("Our team will assign the vehicle and driver after review.", "ทีมงานจะจัดรถและคนขับหลังตรวจสอบ")
            : booking.status === "confirmed"
              ? c("The vehicle and driver have been assigned by our team.", "ทีมงานจัดรถและคนขับเรียบร้อยแล้ว")
              : c("Your trip is complete. Our team can help with any follow-up.", "การเดินทางเสร็จสิ้นแล้ว หากมีเรื่องเพิ่มเติมทีมงานพร้อมช่วยเหลือ")}
        </p>
      </div>

      <Panel title={c("Ride details", "รายละเอียดการเดินทาง")} description={c("Review the route, schedule, vehicle, and price for this booking.", "ตรวจสอบเส้นทาง เวลา รถ และราคาของการจองนี้") }>
        <dl className="mp-detail-grid">
          <DetailField icon={<MapPin size={15} aria-hidden="true" />} label={c("Pickup", "จุดรับ")}>{booking.pickup}</DetailField>
          <DetailField icon={<MapPin size={15} aria-hidden="true" />} label={c("Drop-off", "จุดส่ง")}>{booking.dropoff}</DetailField>
          <DetailField icon={<CalendarDays size={15} aria-hidden="true" />} label={c("Date", "วันที่")}>{formatDate(booking.date, language)}</DetailField>
          <DetailField icon={<Clock3 size={15} aria-hidden="true" />} label={c("Time", "เวลา")}>{booking.time}</DetailField>
          <DetailField icon={vehicleIcon(booking.vehicle)} label={c("Vehicle", "รถ")}>{booking.vehicle}</DetailField>
          <DetailField icon={<Users size={15} aria-hidden="true" />} label={c("Passengers", "ผู้โดยสาร")}>{booking.pax} {c("people", "คน")}</DetailField>
          <DetailField icon={<CircleDollarSign size={15} aria-hidden="true" />} label={c("Trip price", "ราคาเดินทาง")}>{money(booking.amount, booking.currency)}</DetailField>
          <DetailField icon={<ShieldCheck size={15} aria-hidden="true" />} label={c("Pricing basis", "หลักราคา")}>{booking.zone} · {c("whole vehicle", "เหมาคัน")}</DetailField>
        </dl>
      </Panel>

      <Panel title={c("Need help with this booking?", "ต้องการความช่วยเหลือเกี่ยวกับการจองนี้หรือไม่")} description={c("Send a message to our team about this trip.", "ส่งข้อความถึงทีมงานเกี่ยวกับการเดินทางนี้") }>
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
  const { language, tier } = props;
  const c = copyFor(language);
  const heading = (
    <PageHeading
      eyebrow={c("Shuttle · Balance & Payments", "Shuttle · ยอดคงเหลือและการชำระเงิน")}
      title={c("Balance & Payments", "ยอดคงเหลือและการชำระเงิน")}
      description={c("Review your Shuttle balance, payment activity, and transfer notices in one place.", "ตรวจสอบยอด Shuttle รายการชำระเงิน และรายการแจ้งโอนได้ในที่เดียว")}
    />
  );

  if (tier === "General") {
    return (
      <>
        {heading}
        <Panel title={c("Available to VIP+ members", "สำหรับสมาชิก VIP ขึ้นไป")} description={c("Balance details and transfer notices are available to VIP, VVIP, and Business Partner members.", "ยอดคงเหลือและรายการแจ้งโอนเปิดให้สมาชิก VIP, VVIP และ Business Partner ใช้งาน") }>
          <div className="mp-actions">
            <LinkButton to="shuttle/bookings">{c("View My Bookings", "ดูการจองของฉัน")}</LinkButton>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      {heading}
      <BalancePaymentPreview language={language} embedded memberTier={tier} ownerName={props.profile.name} accountKey={props.accountKey} />
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
        <PageHeading eyebrow={c("Shuttle · Business Reports", "Shuttle · รายงานธุรกิจ")} title={c("Business reports are available to Business Partner members", "รายงานธุรกิจสำหรับสมาชิก Business Partner")} description={c("Review your Shuttle bookings from the member navigation.", "ตรวจสอบการจอง Shuttle ได้จากเมนูสมาชิก")} />
        <EmptyState title={c("Business Partner only", "สำหรับ Business Partner เท่านั้น")} description={c("Reports are available in the Business Partner workspace.", "รายงานเปิดให้ใช้งานในพื้นที่สมาชิก Business Partner") }>
          <div className="mp-actions">
            <LinkButton to="membership">{c("Review membership", "ดูข้อมูลสมาชิก")}</LinkButton>
            <LinkButton to="shuttle/bookings" secondary>{c("Back to bookings", "กลับไปการจอง")}</LinkButton>
          </div>
        </EmptyState>
      </>
    );
  }

  const reportBookings = bookingsForAccount(props.accountKey).filter((booking) => {
    if (range === "all") return true;
    return range === "october" ? booking.date.startsWith("2026-10") : booking.date.startsWith("2026-11");
  });
  const reportRangeLabels: Record<ReportRange, string> = {
    all: c("All bookings", "การจองทั้งหมด"),
    october: c("October 2026", "ตุลาคม 2026"),
    november: c("November 2026", "พฤศจิกายน 2026"),
  };

  return (
    <>
      <PageHeading eyebrow={c("Shuttle · Business Reports", "Shuttle · รายงานธุรกิจ")} title={c("Organization overview", "ภาพรวมองค์กร")} description={c("Review Shuttle bookings and spend for your organization.", "ตรวจสอบการจอง Shuttle และยอดใช้จ่ายขององค์กร")} action={<LinkButton to="shuttle/bookings" secondary>{c("My bookings", "การจองของฉัน")}</LinkButton>} />
      <Panel
        title={c("Report period", "ช่วงเวลารายงาน")}
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
          <div><p className="text-sm text-muted-foreground">{c("Bookings", "การจอง")}</p><p className="mp-amount">{reportBookings.length}</p></div>
          <div><p className="text-sm text-muted-foreground">{c("Whole vehicles", "รถเหมาคัน")}</p><p className="mp-amount">{reportBookings.length}</p></div>
          <div><p className="text-sm text-muted-foreground">{c("Booking value", "มูลค่าการจอง")}</p><p className="mp-amount">{money(reportBookings.reduce((sum, item) => sum + item.amount, 0), "THB")}</p></div>
        </div>
      </Panel>
      <Panel title={c("Booking rows", "รายการจอง")} description={c("Shuttle bookings in this period.", "การจอง Shuttle ในช่วงเวลานี้") }>
        {reportBookings.length === 0 ? (
          <EmptyState title={c("No bookings in this period", "ไม่มีการจองในช่วงเวลานี้")} description={c("Choose another date range.", "เลือกช่วงเวลาอื่น")} />
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
    <EmptyState title={c("Shuttle page not found", "ไม่พบหน้า Shuttle")} description={c("Choose My Bookings, Balance & Payments, or Business Reports from the member navigation.", "เลือกการจองของฉัน ยอดคงเหลือและการชำระเงิน หรือรายงานธุรกิจจากเมนูสมาชิก")}>
      <LinkButton to="shuttle/bookings">{c("Open My Bookings", "เปิดการจองของฉัน")}</LinkButton>
    </EmptyState>
  );
}
