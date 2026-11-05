import { useRef, type RefObject } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLevel2Language } from "@/hooks/useLevel2Language";

export interface BookingReviewData {
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  vehicleType: string;
  passengers: string;
  specialRequests: string;
  name: string;
  phone: string;
  email: string;
}

interface BookingConfirmationDialogProps {
  open: boolean;
  details: BookingReviewData | null;
  isSubmitting: boolean;
  returnFocusRef: RefObject<HTMLButtonElement>;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const BookingConfirmationDialog = ({
  open,
  details,
  isSubmitting,
  returnFocusRef,
  onOpenChange,
  onConfirm,
}: BookingConfirmationDialogProps) => {
  const { t, language } = useLevel2Language();
  const editButtonRef = useRef<HTMLButtonElement>(null);

  if (!details) return null;

  const pickupDate = new Intl.DateTimeFormat(language === "en" ? "en-GB" : language, {
    day: "numeric",
    month: "short",
    year: "numeric",
    calendar: "gregory",
    numberingSystem: "latn",
  }).format(new Date(`${details.date}T12:00:00`));
  const pickupTime = `${details.time} ${Number(details.time.split(":")[0]) >= 12 ? "PM" : "AM"}`;
  const vehicleLabels: Record<string, string> = {
    car: t("booking.carOption", "Car (1-4 passengers)"),
    van: t("booking.vanOption", "Van (5-10 passengers)"),
    bus: t("booking.busOption", "Bus (11+ passengers)"),
  };
  const emptyValue = t("booking.reviewEmpty", "Not provided");
  const rows = [
    { key: "pickupLocation", label: t("booking.pickupLocation", "Pickup Location"), value: details.pickupLocation, fullWidth: true },
    { key: "dropoffLocation", label: t("booking.dropoffLocation", "Drop-off Location"), value: details.dropoffLocation, fullWidth: true },
    { key: "date", label: t("booking.pickupDate", "Pickup Date"), value: pickupDate },
    { key: "time", label: t("booking.pickupTime", "Pickup Time"), value: pickupTime },
    { key: "vehicleType", label: t("booking.vehicleType", "Vehicle Type"), value: vehicleLabels[details.vehicleType] || details.vehicleType },
    { key: "passengers", label: t("booking.passengers", "Number of Passengers"), value: details.passengers },
    { key: "name", label: t("booking.yourName", "Your Name"), value: details.name },
    { key: "phone", label: t("booking.phone", "Phone"), value: details.phone },
    { key: "email", label: t("booking.email", "Email"), value: details.email, fullWidth: true },
    { key: "specialRequests", label: t("booking.specialRequests", "Special Requests"), value: details.specialRequests, fullWidth: true },
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col overflow-hidden rounded-lg border-[6px] border-transparent bg-[#162032] p-[19px] text-white"
        style={{ background: "linear-gradient(145deg, #1e2b42 0%, #162032 48%, #0f1623 100%) padding-box, linear-gradient(to bottom right, #bf953f, #fcf6ba, #b38728, #aa771c) border-box" }}
        dir={language === "ar" ? "rtl" : "ltr"}
        aria-busy={isSubmitting}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          editButtonRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            {t("booking.reviewTitle", "Review your booking")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white">
            {t("booking.reviewDescription", "Please check your trip and contact details before confirming.")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <dl className="grid min-h-0 grid-cols-1 gap-3 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.key}
              data-booking-review-field={row.key}
              className={`space-y-1 rounded-lg border-2 border-transparent p-[11px] ${row.fullWidth ? "sm:col-span-2" : ""}`}
              style={{ background: "linear-gradient(to bottom right, #1e2b42, #162032, #0f1623) padding-box, linear-gradient(to bottom right, #bf953f, #fcf6ba, #b38728, #aa771c) border-box" }}
            >
              <dt className="text-sm text-white">{row.label}</dt>
              <dd className="whitespace-pre-wrap break-words text-sm font-medium text-white [overflow-wrap:anywhere]">
                {row.value.trim() ? row.value : emptyValue}
              </dd>
            </div>
          ))}
        </dl>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button
            ref={editButtonRef}
            type="button"
            variant="outline"
            className="border-[#bf953f]/70 bg-transparent text-[#fcf6ba] hover:bg-[#bf953f]/10 hover:text-[#fcf6ba] focus-visible:ring-[#fcf6ba]/70 ring-offset-[#162032]"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            {t("booking.reviewEdit", "Back to edit")}
          </Button>
          <Button type="button" variant="cta" className="border-[#bf953f]/70 bg-[#bf953f] bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-[#162032] hover:border-[#fcf6ba] hover:from-[#cfad61] hover:via-[#fffbd6] hover:to-[#bf953f] focus-visible:ring-[#fcf6ba]/70 ring-offset-[#162032]" disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#78551c]" aria-hidden="true" />
                {t("booking.reviewSubmitting", "Sending booking request...")}
              </>
            ) : (
              t("booking.reviewConfirm", "Confirm and continue")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BookingConfirmationDialog;
