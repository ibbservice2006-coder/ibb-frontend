import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  Bus,
  Check,
  CircleAlert,
  Globe2,
  HeartPulse,
  Mail,
  MessageSquare,
  Monitor,
  Plane,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  copyFor,
  EmptyState,
  LinkButton,
  memberUrl,
  PageHeading,
  Panel,
  PreviewDialog,
  PreviewNote,
  Status,
  tierDescription,
} from "./ui";
import type {
  MemberPageProps,
  MemberTier,
  PreviewLanguage,
  PreviewProfile,
} from "./ui";

type Feedback = { tone: "success" | "error"; message: string };

type DemoDevice = {
  id: string;
  name: [string, string];
  description: [string, string];
  icon: "desktop" | "phone";
};

const DEMO_DEVICES: DemoDevice[] = [
  {
    id: "demo-desktop",
    name: ["Chrome on macOS", "Chrome บน macOS"],
    description: ["Sample desktop session", "เซสชันเดสก์ท็อปตัวอย่าง"],
    icon: "desktop",
  },
  {
    id: "demo-phone",
    name: ["Safari on iPhone", "Safari บน iPhone"],
    description: ["Sample mobile session", "เซสชันมือถือ ตัวอย่าง"],
    icon: "phone",
  },
];

const TIERS: MemberTier[] = ["General", "VIP", "VVIP", "Business Partner"];

function profileDraftFrom(profile: PreviewProfile): PreviewProfile {
  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    country: profile.country,
  };
}

function FeedbackNote({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;
  return (
    <div className={`mp-note ${feedback.tone === "error" ? "mp-error" : ""}`} role={feedback.tone === "error" ? "alert" : "status"}>
      {feedback.tone === "error" ? <CircleAlert size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
      <p>{feedback.message}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="mp-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function PreferenceSwitch({
  label,
  description,
  pressed,
  onToggle,
  language,
}: {
  label: string;
  description: string;
  pressed: boolean;
  onToggle: () => void;
  language: PreviewLanguage;
}) {
  const c = copyFor(language);
  return (
    <div className="mp-list-row">
      <div>
        <h3 className="font-semibold">{label}</h3>
        <p className="mp-description">{description}</p>
      </div>
      <div className="mp-actions">
        <Status tone={pressed ? "green" : "muted"}>
          {pressed ? c("On", "เปิด") : c("Off", "ปิด")}
        </Status>
        <button
          type="button"
          className="mp-switch"
          aria-pressed={pressed}
          aria-label={`${label}: ${pressed ? c("On", "เปิด") : c("Off", "ปิด")}`}
          onClick={onToggle}
        >
          <span aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ProfilePage({ props }: { props: MemberPageProps }) {
  const c = copyFor(props.language);
  const [draft, setDraft] = useState<PreviewProfile>(() => profileDraftFrom(props.profile));
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setDraft(profileDraftFrom(props.profile));
  }, [props.profile]);

  const update = (key: keyof PreviewProfile, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextProfile = profileDraftFrom(draft);

    if (!nextProfile.name.trim() || !nextProfile.email.trim() || !nextProfile.phone.trim() || !nextProfile.country.trim()) {
      setFeedback({
        tone: "error",
        message: c("Please complete every profile field before saving.", "กรุณากรอกข้อมูลโปรไฟล์ให้ครบทุกช่องก่อนบันทึก"),
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(nextProfile.email.trim())) {
      setFeedback({
        tone: "error",
        message: c("Enter a valid email format for this demo.", "กรุณากรอกรูปแบบอีเมลที่ถูกต้องสำหรับตัวอย่างนี้"),
      });
      return;
    }

    const savedProfile = {
      name: nextProfile.name.trim(),
      email: nextProfile.email.trim(),
      phone: nextProfile.phone.trim(),
      country: nextProfile.country.trim(),
    };
    props.onProfileChange(savedProfile);
    setDraft(savedProfile);
    setFeedback({
      tone: "success",
      message: c("Profile changes were saved in this preview only.", "บันทึกการเปลี่ยนแปลงโปรไฟล์ในพรีวิวนี้เท่านั้นแล้ว"),
    });
    props.notify(c("Profile changes saved in this preview.", "บันทึกข้อมูลโปรไฟล์ในพรีวิวนี้แล้ว"));
  };

  const handleCancel = () => {
    setDraft(profileDraftFrom(props.profile));
    setFeedback({
      tone: "success",
      message: c("The form was reset to the supplied demo profile.", "รีเซ็ตฟอร์มกลับเป็นข้อมูลโปรไฟล์ตัวอย่างที่ให้มาแล้ว"),
    });
  };

  return (
    <>
      <PageHeading
        eyebrow={c("Central IBB account", "บัญชี IBB ส่วนกลาง")}
        title={c("Profile", "โปรไฟล์")}
        description={c("Keep the example contact details for your central IBB account in one place.", "จัดการข้อมูลติดต่อในบัญชี IBB ส่วนกลางของตัวอย่างนี้ไว้ในที่เดียว")}
      />
      <Panel
        title={c("Profile details", "รายละเอียดโปรไฟล์")}
        description={c("These fields use the mock profile supplied to the preview.", "ช่องเหล่านี้ใช้ข้อมูลโปรไฟล์ตัวอย่างที่ส่งให้พรีวิว")}
      >
        <form onSubmit={handleSubmit}>
          <div className="mp-form-grid">
            <Field
              id="member-profile-name"
              label={c("Name", "ชื่อ")}
              value={draft.name}
              onChange={(value) => update("name", value)}
              autoComplete="name"
            />
            <Field
              id="member-profile-email"
              label={c("Email", "อีเมล")}
              value={draft.email}
              onChange={(value) => update("email", value)}
              type="email"
              autoComplete="email"
            />
            <Field
              id="member-profile-phone"
              label={c("Phone", "โทรศัพท์")}
              value={draft.phone}
              onChange={(value) => update("phone", value)}
              type="tel"
              autoComplete="tel"
            />
            <Field
              id="member-profile-country"
              label={c("Country", "ประเทศ")}
              value={draft.country}
              onChange={(value) => update("country", value)}
              autoComplete="country-name"
            />
          </div>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={handleCancel}>
              {c("Cancel", "ยกเลิก")}
            </button>
            <button type="submit" className="mp-button">
              {c("Save changes", "บันทึกการเปลี่ยนแปลง")}
            </button>
          </div>
          <FeedbackNote feedback={feedback} />
        </form>
      </Panel>
      <PreviewNote>
        {c(
          "This is a local preview: saving updates the supplied mock profile in memory only.",
          "นี่คือพรีวิวในเครื่อง การบันทึกจะอัปเดตข้อมูลโปรไฟล์ตัวอย่างในหน่วยความจำเท่านั้น",
        )}
      </PreviewNote>
    </>
  );
}

function SecurityPage({ props }: { props: MemberPageProps }) {
  const c = copyFor(props.language);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [revokedDeviceIds, setRevokedDeviceIds] = useState<string[]>([]);
  const [deviceToRevoke, setDeviceToRevoke] = useState<DemoDevice | null>(null);
  const [deviceFeedback, setDeviceFeedback] = useState<Feedback | null>(null);

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setFeedback({
        tone: "error",
        message: c("Complete all three password fields for the simulation.", "กรุณากรอกรหัสผ่านทั้งสามช่องสำหรับการจำลอง"),
      });
      return;
    }
    if (passwords.next.length < 8) {
      setFeedback({
        tone: "error",
        message: c("Use at least 8 characters for the simulated new password.", "ใช้รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษรสำหรับการจำลอง"),
      });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setFeedback({
        tone: "error",
        message: c("The new password and confirmation do not match.", "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน"),
      });
      return;
    }

    setPasswords({ current: "", next: "", confirm: "" });
    setFeedback({
      tone: "success",
      message: c(
        "Demo only: the password change was simulated, the fields were cleared, and no password was stored.",
        "ตัวอย่างเท่านั้น: จำลองการเปลี่ยนรหัสผ่าน ล้างช่องกรอกแล้ว และไม่มีการจัดเก็บรหัสผ่าน",
      ),
    });
  };

  const revokeDevice = () => {
    if (!deviceToRevoke) return;
    setRevokedDeviceIds((current) => [...current, deviceToRevoke.id]);
    setDeviceFeedback({
      tone: "success",
      message: c(
        `${deviceToRevoke.name[0]} was removed from the sample list in this preview.`,
        `นำ ${deviceToRevoke.name[1]} ออกจากรายการตัวอย่างในพรีวิวนี้แล้ว`,
      ),
    });
    setDeviceToRevoke(null);
  };

  const restoreDevices = () => {
    setRevokedDeviceIds([]);
    setDeviceFeedback({
      tone: "success",
      message: c("The sample device rows were restored.", "คืนรายการอุปกรณ์ตัวอย่างแล้ว"),
    });
  };

  const visibleDevices = DEMO_DEVICES.filter((device) => !revokedDeviceIds.includes(device.id));

  return (
    <>
      <PageHeading
        eyebrow={c("Central IBB account", "บัญชี IBB ส่วนกลาง")}
        title={c("Security", "ความปลอดภัย")}
        description={c("Review the safe, local-only security interactions included in this preview.", "ตรวจสอบการโต้ตอบด้านความปลอดภัยแบบจำลองที่ทำงานในพรีวิวนี้เท่านั้น")}
      />
      <Panel
        title={c("Change password", "เปลี่ยนรหัสผ่าน")}
        description={c("The form validates the example interaction but never persists a password.", "ฟอร์มนี้ตรวจสอบการโต้ตอบตัวอย่าง แต่ไม่จัดเก็บรหัสผ่าน")}
      >
        <form onSubmit={submitPassword}>
          <div className="mp-form-grid">
            <Field
              id="member-current-password"
              label={c("Current password", "รหัสผ่านปัจจุบัน")}
              value={passwords.current}
              onChange={(value) => {
                setPasswords((current) => ({ ...current, current: value }));
                setFeedback(null);
              }}
              type="password"
              autoComplete="current-password"
            />
            <Field
              id="member-new-password"
              label={c("New password", "รหัสผ่านใหม่")}
              value={passwords.next}
              onChange={(value) => {
                setPasswords((current) => ({ ...current, next: value }));
                setFeedback(null);
              }}
              type="password"
              autoComplete="new-password"
            />
            <Field
              id="member-confirm-password"
              label={c("Confirm new password", "ยืนยันรหัสผ่านใหม่")}
              value={passwords.confirm}
              onChange={(value) => {
                setPasswords((current) => ({ ...current, confirm: value }));
                setFeedback(null);
              }}
              type="password"
              autoComplete="new-password"
            />
          </div>
          <div className="mp-actions">
            <button type="submit" className="mp-button">
              {c("Simulate password change", "จำลองการเปลี่ยนรหัสผ่าน")}
            </button>
          </div>
          <FeedbackNote feedback={feedback} />
        </form>
      </Panel>

      <Panel
        title={c("Sample devices", "อุปกรณ์ตัวอย่าง")}
        description={c("These rows are mock data in local memory, not a security or sign-in record.", "รายการเหล่านี้เป็นข้อมูลตัวอย่างในหน่วยความจำ ไม่ใช่บันทึกความปลอดภัยหรือการเข้าสู่ระบบ")}
      >
        {deviceFeedback && <FeedbackNote feedback={deviceFeedback} />}
        {visibleDevices.length > 0 ? (
          <div>
            {visibleDevices.map((device) => (
              <div className="mp-list-row" key={device.id}>
                <div className="mp-detail-grid">
                  <div className="mp-icon-tile" aria-hidden="true">
                    {device.icon === "desktop" ? <Monitor size={20} /> : <Smartphone size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{c(device.name[0], device.name[1])}</h3>
                    <p className="mp-description">{c(device.description[0], device.description[1])}</p>
                  </div>
                </div>
                <div className="mp-actions">
                  <Status tone="muted">{c("Preview sample", "ตัวอย่างพรีวิว")}</Status>
                  <button
                    type="button"
                    className="mp-button mp-button-secondary"
                    onClick={() => setDeviceToRevoke(device)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    {c("Revoke demo row", "ถอนรายการตัวอย่าง")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={c("No sample devices remain", "ไม่เหลืออุปกรณ์ตัวอย่าง")}
            description={c("Restore the local rows if you want to review the revoke interaction again.", "คืนรายการในเครื่องหากต้องการดูการโต้ตอบการถอนรายการอีกครั้ง")}
          >
            <button type="button" className="mp-button mp-button-secondary" onClick={restoreDevices}>
              {c("Restore sample rows", "คืนรายการตัวอย่าง")}
            </button>
          </EmptyState>
        )}
      </Panel>
      <PreviewNote>
        {c(
          "No device, password, authentication, or security claim is connected to a live service in this preview.",
          "ไม่มีอุปกรณ์ รหัสผ่าน การยืนยันตัวตน หรือข้อมูลความปลอดภัยใดเชื่อมต่อกับบริการจริงในพรีวิวนี้",
        )}
      </PreviewNote>

      {deviceToRevoke && (
        <PreviewDialog
          title={c("Remove this sample row?", "นำรายการตัวอย่างนี้ออกหรือไม่")}
          description={c(
            "This only changes the local device list shown in the preview.",
            "การดำเนินการนี้เปลี่ยนเฉพาะรายการอุปกรณ์ในพรีวิวนี้เท่านั้น",
          )}
          onClose={() => setDeviceToRevoke(null)}
        >
          <div className="mp-note">
            <Trash2 size={16} aria-hidden="true" />
            <p>{c(deviceToRevoke.name[0], deviceToRevoke.name[1])}</p>
          </div>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={() => setDeviceToRevoke(null)}>
              {c("Keep row", "เก็บรายการไว้")}
            </button>
            <button type="button" className="mp-button" onClick={revokeDevice}>
              {c("Remove demo row", "นำรายการตัวอย่างออก")}
            </button>
          </div>
        </PreviewDialog>
      )}
    </>
  );
}

function PreferencesPage({ props }: { props: MemberPageProps }) {
  const c = copyFor(props.language);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(false);

  return (
    <>
      <PageHeading
        eyebrow={c("Central IBB account", "บัญชี IBB ส่วนกลาง")}
        title={c("Preferences", "การตั้งค่า")}
        description={c("Choose the language and preview-only notification preferences for this screen.", "เลือกภาษาและการตั้งค่าการแจ้งเตือนที่มีผลเฉพาะบนหน้าจอตัวอย่างนี้")}
      />
      <Panel
        title={c("Language", "ภาษา")}
        description={c("Language changes are passed to the preview shell immediately.", "การเปลี่ยนภาษาจะส่งต่อไปยังโครงหน้าพรีวิวทันที")}
      >
        <div className="mp-field">
          <label htmlFor="member-language">{c("Display language", "ภาษาที่แสดง")}</label>
          <select
            id="member-language"
            value={props.language}
            onChange={(event) => props.onLanguageChange(event.target.value as PreviewLanguage)}
          >
            <option value="en">{c("English", "อังกฤษ")}</option>
            <option value="th">{c("Thai", "ไทย")}</option>
          </select>
        </div>
      </Panel>
      <Panel
        title={c("Notifications", "การแจ้งเตือน")}
        description={c("These switches stay local to the preview and do not send email or SMS.", "สวิตช์เหล่านี้มีผลเฉพาะในพรีวิว และไม่ส่งอีเมลหรือ SMS จริง")}
      >
        <PreferenceSwitch
          language={props.language}
          label={c("Email updates", "อัปเดตทางอีเมล")}
          description={c("Show the email preference state in this demo.", "แสดงสถานะการตั้งค่าอีเมลในตัวอย่างนี้")}
          pressed={emailUpdates}
          onToggle={() => setEmailUpdates((current) => !current)}
        />
        <div className="mp-rule" />
        <PreferenceSwitch
          language={props.language}
          label={c("SMS updates", "อัปเดตทาง SMS")}
          description={c("Show the SMS preference state in this demo.", "แสดงสถานะการตั้งค่า SMS ในตัวอย่างนี้")}
          pressed={smsUpdates}
          onToggle={() => setSmsUpdates((current) => !current)}
        />
      </Panel>
      <PreviewNote>
        {c(
          "Preference changes are visual only and are not saved or sent to a provider.",
          "การเปลี่ยนการตั้งค่าเป็นเพียงการแสดงผล และจะไม่ถูกบันทึกหรือส่งไปยังผู้ให้บริการ",
        )}
      </PreviewNote>
    </>
  );
}

function MembershipTierRow({
  tier,
  currentTier,
  language,
}: {
  tier: MemberTier;
  currentTier: MemberTier;
  language: PreviewLanguage;
}) {
  const c = copyFor(language);
  const isCurrent = tier === currentTier;
  return (
    <div className="mp-list-row">
      <div>
        <h3 className="font-semibold">{tier}</h3>
        <p className="mp-description">{tierDescription(tier, language)}</p>
        {tier === "Business Partner" && (
          <LinkButton to="shuttle/reports" secondary>
            {c("Open sample Shuttle reports", "เปิดรายงาน Shuttle ตัวอย่าง")}
          </LinkButton>
        )}
      </div>
      {isCurrent && <Status>{c("Current in this preview", "ปัจจุบันในพรีวิวนี้")}</Status>}
    </div>
  );
}

function MembershipPage({ props }: { props: MemberPageProps }) {
  const c = copyFor(props.language);
  return (
    <>
      <PageHeading
        eyebrow={c("Central IBB account", "บัญชี IBB ส่วนกลาง")}
        title={c("Membership", "สมาชิก")}
        description={c("Review the Shuttle-specific membership context without adding fees or upgrade rules.", "ดูบริบทสมาชิกเฉพาะ Shuttle โดยไม่มีค่าธรรมเนียมหรือกติกาการเลื่อนระดับเพิ่มเติม")}
      />
      <Panel
        title={c("Central IBB account", "บัญชี IBB ส่วนกลาง")}
        description={c("Profile, security, preferences, and this membership view belong to the central IBB account.", "โปรไฟล์ ความปลอดภัย การตั้งค่า และหน้าสมาชิกนี้อยู่ในบัญชี IBB ส่วนกลาง")}
      >
        <div className="mp-detail-grid">
          <div>
            <p className="mp-eyebrow">{c("Account scope", "ขอบเขตบัญชี")}</p>
            <p className="font-semibold">{c("One IBB account", "บัญชี IBB เดียว")}</p>
          </div>
          <div>
            <p className="mp-eyebrow">{c("Service scope", "ขอบเขตบริการ")}</p>
            <p className="font-semibold">{c("Shuttle membership only", "สมาชิกเฉพาะ Shuttle")}</p>
          </div>
        </div>
        <div className="mp-rule" />
        <PreviewNote>
          {c(
            "Travel and Health do not have memberships in this preview.",
            "Travel และ Health ยังไม่มีระบบสมาชิกในพรีวิวนี้",
          )}
        </PreviewNote>
      </Panel>
      <Panel
        title={c("Shuttle membership", "สมาชิก Shuttle")}
        description={c("Compare the four service tiers described for this prototype.", "เปรียบเทียบระดับบริการทั้งสี่ตามที่ระบุไว้สำหรับต้นแบบนี้")}
      >
        <div>
          {TIERS.map((tier, index) => (
            <div key={tier}>
              <MembershipTierRow tier={tier} currentTier={props.tier} language={props.language} />
              {index < TIERS.length - 1 && <div className="mp-rule" />}
            </div>
          ))}
        </div>
      </Panel>
      <PreviewNote>
        {c(
          "Membership information here is descriptive only. It does not create a fee, discount, points balance, renewal, upgrade threshold, or tier change.",
          "ข้อมูลสมาชิกนี้เป็นคำอธิบายเท่านั้น ไม่ได้สร้างค่าธรรมเนียม ส่วนลด แต้ม การต่ออายุ เกณฑ์เลื่อนระดับ หรือการเปลี่ยนระดับสมาชิก",
        )}
      </PreviewNote>
    </>
  );
}

function ServiceRow({
  icon,
  name,
  description,
  status,
  action,
}: {
  icon: ReactNode;
  name: string;
  description: string;
  status: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mp-service-row">
      <div className="mp-icon-tile" aria-hidden="true">
        {icon}
      </div>
      <div className="mp-service-copy">
        <h3 className="font-semibold">{name}</h3>
        <p className="mp-description">{description}</p>
      </div>
      <div className="mp-actions">
        {status}
        {action}
      </div>
    </div>
  );
}

function ServicesPage({ props }: { props: MemberPageProps }) {
  const c = copyFor(props.language);
  return (
    <>
      <PageHeading
        eyebrow={c("Central IBB account", "บัญชี IBB ส่วนกลาง")}
        title={c("IBB Services", "บริการ IBB")}
        description={c("Move from the central account into a service area when it is available in this prototype.", "ไปยังพื้นที่บริการจากบัญชีกลางเมื่อบริการนั้นเปิดใช้งานในต้นแบบนี้")}
      />
      <Panel
        title={c("Service areas", "พื้นที่บริการ")}
        description={c("Shuttle is the only open service area in this preview.", "Shuttle เป็นพื้นที่บริการเดียวที่เปิดในพรีวิวนี้")}
      >
        <div className="mp-services-list">
          <ServiceRow
            icon={<Bus size={20} />}
            name={c("Shuttle", "Shuttle")}
            description={c("Bookings and service-specific member activity.", "การจองและกิจกรรมสมาชิกเฉพาะบริการ")}
            status={<Status>{c("Available", "พร้อมใช้งาน")}</Status>}
            action={
              <Link className="mp-text-link" to={memberUrl("shuttle/bookings")}>
                {c("Open Shuttle", "เปิด Shuttle")}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            }
          />
          <div className="mp-rule" />
          <ServiceRow
            icon={<Plane size={20} />}
            name={c("Travel", "Travel")}
            description={c("This service area is not open yet.", "พื้นที่บริการนี้ยังไม่เปิด")}
            status={<Status tone="amber">{c("Coming soon", "เร็ว ๆ นี้")}</Status>}
          />
          <div className="mp-rule" />
          <ServiceRow
            icon={<HeartPulse size={20} />}
            name={c("Health", "Health")}
            description={c("This service area is not open yet.", "พื้นที่บริการนี้ยังไม่เปิด")}
            status={<Status tone="amber">{c("Coming soon", "เร็ว ๆ นี้")}</Status>}
          />
        </div>
      </Panel>
      <PreviewNote>
        {c(
          "Travel and Health have no booking or balance area in this preview, so they remain non-clickable.",
          "Travel และ Health ยังไม่มีพื้นที่จองหรือยอดเงินในพรีวิวนี้ จึงไม่มีลิงก์ให้กด",
        )}
      </PreviewNote>
    </>
  );
}

export default function AccountPages(props: MemberPageProps) {
  switch (props.page) {
    case "security":
      return <SecurityPage props={props} />;
    case "preferences":
      return <PreferencesPage props={props} />;
    case "membership":
      return <MembershipPage props={props} />;
    case "services":
      return <ServicesPage props={props} />;
    case "profile":
    default:
      return <ProfilePage props={props} />;
  }
}
