import { useEffect, useState, type FormEvent } from "react";
import { ALL_LANGUAGES } from "@/lib/level2-language";
import {
  Check,
  CircleAlert,
  Monitor,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  copyFor,
  EmptyState,
  LinkButton,
  PageHeading,
  Panel,
  PreviewDialog,
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

type AccountDevice = {
  id: string;
  name: [string, string];
  description: [string, string];
  icon: "desktop" | "phone";
};

const ACCOUNT_DEVICES: AccountDevice[] = [
  {
    id: "desktop",
    name: ["Chrome on macOS", "Chrome บน macOS"],
    description: ["Desktop session", "เซสชันเดสก์ท็อป"],
    icon: "desktop",
  },
  {
    id: "phone",
    name: ["Safari on iPhone", "Safari บน iPhone"],
    description: ["Mobile session", "เซสชันมือถือ"],
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
        message: c("Enter a valid email address.", "กรุณากรอกอีเมลให้ถูกต้อง"),
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
      message: c("Changes saved", "บันทึกการเปลี่ยนแปลงแล้ว"),
    });
    props.notify(c("Changes saved", "บันทึกการเปลี่ยนแปลงแล้ว"));
  };

  const handleCancel = () => {
    setDraft(profileDraftFrom(props.profile));
    setFeedback({
      tone: "success",
      message: c("Changes canceled", "ยกเลิกการเปลี่ยนแปลงแล้ว"),
    });
  };

  return (
    <>
      <PageHeading
        eyebrow={c("MY IBB ACCOUNT", "บัญชี IBB ของฉัน")}
        title={c("Personal information", "ข้อมูลส่วนตัว")}
        description={c("Manage your contact information in one place.", "จัดการข้อมูลติดต่อของคุณได้ในที่เดียว")}
      />
      <Panel
        title={c("Contact information", "ข้อมูลติดต่อ")}
        description={c("Keep your contact information up to date.", "อัปเดตข้อมูลติดต่อของคุณให้เป็นปัจจุบัน")}
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
    </>
  );
}

function SecurityPage({ props }: { props: MemberPageProps }) {
  const c = copyFor(props.language);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [revokedDeviceIds, setRevokedDeviceIds] = useState<string[]>([]);
  const [deviceToRevoke, setDeviceToRevoke] = useState<AccountDevice | null>(null);
  const [deviceFeedback, setDeviceFeedback] = useState<Feedback | null>(null);

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setFeedback({
        tone: "error",
        message: c("Complete all password fields.", "กรุณากรอกรหัสผ่านให้ครบทุกช่อง"),
      });
      return;
    }
    if (passwords.next.length < 8) {
      setFeedback({
        tone: "error",
        message: c("Use at least 8 characters.", "ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร"),
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
      message: c("Password updated", "อัปเดตรหัสผ่านแล้ว"),
    });
  };

  const revokeDevice = () => {
    if (!deviceToRevoke) return;
    setRevokedDeviceIds((current) => [...current, deviceToRevoke.id]);
    setDeviceFeedback({
      tone: "success",
      message: c(`${deviceToRevoke.name[0]} access was revoked.`, `เพิกถอนการเข้าถึงของ ${deviceToRevoke.name[1]} แล้ว`),
    });
    setDeviceToRevoke(null);
  };

  const restoreDevices = () => {
    setRevokedDeviceIds([]);
    setDeviceFeedback({
      tone: "success",
      message: c("Devices restored.", "กู้คืนรายการอุปกรณ์แล้ว"),
    });
  };

  const visibleDevices = ACCOUNT_DEVICES.filter((device) => !revokedDeviceIds.includes(device.id));

  return (
    <>
      <PageHeading
        eyebrow={c("MY IBB ACCOUNT", "บัญชี IBB ของฉัน")}
        title={c("Login & security", "การเข้าสู่ระบบและความปลอดภัย")}
        description={c("Manage your password and review devices signed in to your account.", "จัดการรหัสผ่านและตรวจสอบอุปกรณ์ที่เข้าสู่ระบบบัญชีของคุณ")}
      />
      <Panel
        title={c("Change password", "เปลี่ยนรหัสผ่าน")}
        description={c("Use your current password to set a new password.", "ใช้รหัสผ่านปัจจุบันเพื่อตั้งรหัสผ่านใหม่")}
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
              {c("Change password", "เปลี่ยนรหัสผ่าน")}
            </button>
          </div>
          <FeedbackNote feedback={feedback} />
        </form>
      </Panel>

      <Panel
        title={c("Devices", "อุปกรณ์")}
        description={c("Review devices that have recently accessed your account.", "ตรวจสอบอุปกรณ์ที่เข้าถึงบัญชีของคุณล่าสุด")}
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
                  <Status tone="green">{c("Active", "กำลังใช้งาน")}</Status>
                  <button
                    type="button"
                    className="mp-button mp-button-secondary"
                    onClick={() => setDeviceToRevoke(device)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    {c("Revoke access", "เพิกถอนการเข้าถึง")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={c("No devices found", "ไม่พบอุปกรณ์")}
            description={c("There are no active devices to display.", "ไม่มีอุปกรณ์ที่กำลังใช้งานให้แสดง")}
          >
            <button type="button" className="mp-button mp-button-secondary" onClick={restoreDevices}>
              {c("Restore devices", "กู้คืนรายการอุปกรณ์")}
            </button>
          </EmptyState>
        )}
      </Panel>

      {deviceToRevoke && (
        <PreviewDialog
          title={c("Revoke access for this device?", "เพิกถอนการเข้าถึงของอุปกรณ์นี้หรือไม่")}
          description={c("You can sign in again from this device later.", "คุณสามารถเข้าสู่ระบบจากอุปกรณ์นี้ได้อีกครั้งในภายหลัง")}
          onClose={() => setDeviceToRevoke(null)}
        >
          <div className="mp-note">
            <Trash2 size={16} aria-hidden="true" />
            <p>{c(deviceToRevoke.name[0], deviceToRevoke.name[1])}</p>
          </div>
          <div className="mp-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={() => setDeviceToRevoke(null)}>
              {c("Cancel", "ยกเลิก")}
            </button>
            <button type="button" className="mp-button" onClick={revokeDevice}>
              {c("Revoke access", "เพิกถอนการเข้าถึง")}
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
        eyebrow={c("MY IBB ACCOUNT", "บัญชี IBB ของฉัน")}
        title={c("Preferences", "การตั้งค่า")}
        description={c("Manage your language and notification preferences.", "จัดการภาษาและการแจ้งเตือนของคุณ")}
      />
      <Panel
        title={c("Language", "ภาษา")}
        description={c("Choose your preferred display language.", "เลือกภาษาที่ต้องการแสดงผล")}
      >
        <div className="mp-field">
          <label htmlFor="member-language">{c("Display language", "ภาษาที่แสดง")}</label>
          <select
            id="member-language"
            value={props.language}
            onChange={(event) => props.onLanguageChange(event.target.value as PreviewLanguage)}
          >
            {ALL_LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.label}</option>)}
          </select>
        </div>
      </Panel>
      <Panel
        title={c("Notifications", "การแจ้งเตือน")}
        description={c("Choose which updates you would like to receive.", "เลือกอัปเดตที่คุณต้องการรับ")}
      >
        <PreferenceSwitch
          language={props.language}
          label={c("Email updates", "อัปเดตทางอีเมล")}
          description={c("Receive account updates by email.", "รับอัปเดตบัญชีทางอีเมล")}
          pressed={emailUpdates}
          onToggle={() => setEmailUpdates((current) => !current)}
        />
        <div className="mp-rule" />
        <PreferenceSwitch
          language={props.language}
          label={c("SMS updates", "อัปเดตทาง SMS")}
          description={c("Receive account updates by SMS.", "รับอัปเดตบัญชีทาง SMS")}
          pressed={smsUpdates}
          onToggle={() => setSmsUpdates((current) => !current)}
        />
      </Panel>
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
            {c("Open Shuttle reports", "เปิดรายงาน Shuttle")}
          </LinkButton>
        )}
      </div>
      {isCurrent && <Status>{c("Current membership", "สมาชิกปัจจุบัน")}</Status>}
    </div>
  );
}

function MembershipPage({ props }: { props: MemberPageProps }) {
  const c = copyFor(props.language);
  return (
    <>
      <PageHeading
        eyebrow={c("SHUTTLE MEMBERSHIP", "สมาชิก SHUTTLE")}
        title={c("Membership", "สมาชิก")}
        description={c("Review your Shuttle membership and available tiers.", "ตรวจสอบสมาชิก Shuttle และระดับสมาชิกที่มีให้เลือก")}
      />
      <Panel
        title={c("Shuttle membership", "สมาชิก Shuttle")}
        description={c("Your membership level and service access for Shuttle.", "ระดับสมาชิกและสิทธิ์การใช้บริการ Shuttle ของคุณ")}
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
      </Panel>
      <Panel
        title={c("Shuttle membership", "สมาชิก Shuttle")}
        description={c("Explore the four membership tiers available for Shuttle.", "ดูระดับสมาชิกทั้งสี่ระดับที่มีให้สำหรับ Shuttle")}
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
    case "profile":
    default:
      return <ProfilePage props={props} />;
  }
}
