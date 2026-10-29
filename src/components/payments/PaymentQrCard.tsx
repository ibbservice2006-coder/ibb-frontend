import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentQrMethods, type QrPaymentMethod } from "./receiving-qr";

interface PaymentQrCardProps {
  method: QrPaymentMethod;
  language?: string;
  showRecipient?: boolean;
}

export default function PaymentQrCard({ method, language = "en", showRecipient = true }: PaymentQrCardProps) {
  const qr = paymentQrMethods[method];
  const th = language === "th";

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-white p-4 mb-4 text-center" data-payment-qr={method}>
      <p className="text-sm font-medium">{th ? `สแกนด้วย ${qr.name}` : `Scan with ${qr.name}`}</p>
      <img
        src={qr.image}
        alt={th ? `QR รับเงิน ${qr.name}` : `${qr.name} payment QR code`}
        className="block w-64 max-w-full aspect-square object-contain"
        width="256"
        height="256"
        decoding="async"
      />
      {showRecipient && <p className="text-sm">{qr.recipient}</p>}
      <Button asChild type="button" size="sm" variant="outline">
        <a href={qr.image} download={qr.downloadName}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          {th ? "บันทึก QR" : "Save QR"}
        </a>
      </Button>
    </div>
  );
}
