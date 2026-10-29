import wechatQr from "@/assets/payments/wechat-receive-qr.png";
import alipayQr from "@/assets/payments/alipay-receive-qr.png";

export type QrPaymentMethod = "wechat" | "alipay";

export const paymentQrMethods = {
  wechat: {
    name: "WeChat Pay",
    recipient: "-Charoonsak(***K)",
    image: wechatQr,
    downloadName: "IBB-WeChat-Pay-QR.png",
  },
  alipay: {
    name: "Alipay",
    recipient: "* CHAROONSAK",
    image: alipayQr,
    downloadName: "IBB-Alipay-QR.png",
  },
} satisfies Record<QrPaymentMethod, {
  name: string;
  recipient: string;
  image: string;
  downloadName: string;
}>;
