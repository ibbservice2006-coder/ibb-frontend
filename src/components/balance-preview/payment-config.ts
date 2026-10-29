export type CurrencyCode = 'THB' | 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY';
export type MethodId = 'thai_bank' | 'thai_qr' | 'wechat' | 'alipay' | 'grey';
export type TransferStatus = 'pending' | 'approved' | 'needs_info' | 'rejected';

export interface PaymentDetail {
  labelEn: string;
  labelTh: string;
  value: string;
}

export interface ReceivingMethod {
  id: MethodId;
  name: string;
  kind: 'bank' | 'qr';
  details: PaymentDetail[];
  extraDetails?: PaymentDetail[];
}

export interface CurrencyOption {
  code: CurrencyCode;
  nameEn: string;
  nameTh: string;
  exampleBalance: number;
  exampleLimit: number | null;
  methods: ReceivingMethod[];
}

const thaiBankDetails: PaymentDetail[] = [
  { labelEn: 'Account no.', labelTh: 'เลขที่บัญชี', value: '—' },
  { labelEn: 'Account holder', labelTh: 'ชื่อผู้รับ', value: '—' },
  { labelEn: 'Bank', labelTh: 'ธนาคาร', value: '—' },
];

const greyBankDetails: PaymentDetail[] = [
  { labelEn: 'Account no.', labelTh: 'เลขที่บัญชี', value: '—' },
  { labelEn: 'Account holder', labelTh: 'ชื่อผู้รับ', value: '—' },
  { labelEn: 'Bank', labelTh: 'ธนาคาร', value: '—' },
];

const greyExtraDetails: PaymentDetail[] = [
  {
    labelEn: 'Transfer instructions',
    labelTh: 'คำแนะนำการโอนเงิน',
    value: '—',
  },
];

const placeholderQrDetails: PaymentDetail[] = [
  { labelEn: 'Recipient', labelTh: 'ผู้รับเงิน', value: '—' },
];

const greyMethod = (currency: CurrencyCode): ReceivingMethod => ({
  id: 'grey',
  name: `Grey Bank Transfer (${currency})`,
  kind: 'bank',
  details: greyBankDetails.map((detail) => ({ ...detail })),
  extraDetails: greyExtraDetails,
});

export const currencyOptions: CurrencyOption[] = [
  {
    code: 'THB',
    nameEn: 'Thai Baht',
    nameTh: 'บาทไทย',
    exampleBalance: 40000,
    exampleLimit: 200000,
    methods: [
      {
        id: 'thai_bank',
        name: 'Thai Bank Transfer',
        kind: 'bank',
        details: thaiBankDetails,
      },
      {
        id: 'thai_qr',
        name: 'Thai QR',
        kind: 'qr',
        details: placeholderQrDetails,
      },
    ],
  },
  {
    code: 'CNY',
    nameEn: 'Chinese Yuan',
    nameTh: 'หยวนจีน',
    exampleBalance: 3000,
    exampleLimit: null,
    methods: [
      {
        id: 'wechat',
        name: 'WeChat Pay',
        kind: 'qr',
        details: placeholderQrDetails,
      },
      {
        id: 'alipay',
        name: 'Alipay QR',
        kind: 'qr',
        details: placeholderQrDetails,
      },
    ],
  },
  {
    code: 'USD',
    nameEn: 'US Dollar',
    nameTh: 'ดอลลาร์สหรัฐ',
    exampleBalance: 800,
    exampleLimit: null,
    methods: [greyMethod('USD')],
  },
  {
    code: 'EUR',
    nameEn: 'Euro',
    nameTh: 'ยูโร',
    exampleBalance: 500,
    exampleLimit: null,
    methods: [greyMethod('EUR')],
  },
  {
    code: 'GBP',
    nameEn: 'British Pound',
    nameTh: 'ปอนด์อังกฤษ',
    exampleBalance: 250,
    exampleLimit: null,
    methods: [greyMethod('GBP')],
  },
  {
    code: 'JPY',
    nameEn: 'Japanese Yen',
    nameTh: 'เยนญี่ปุ่น',
    exampleBalance: 30000,
    exampleLimit: null,
    methods: [greyMethod('JPY')],
  },
];

export interface TransferNotice {
  id: string;
  currency: CurrencyCode;
  methodId: MethodId;
  amount: number;
  date: string;
  time: string;
  status: TransferStatus;
  note?: string;
  fileName?: string;
  payerName?: string;
}

export function balanceForAccount(base: number, email: string) {
  const key = email.trim().toLowerCase();
  if (key === 'jamie@example.com') return base * 2;
  if (key === 'company@example.com') return base * 3;
  return key === 'alex@example.com' ? base : 0;
}

export const exampleTransferNotices: TransferNotice[] = [
  {
    id: 'DEMO-1029-001',
    currency: 'THB',
    methodId: 'thai_bank',
    amount: 10000,
    date: '2026-10-29',
    time: '10:30',
    status: 'pending',
    note: 'Demo notice for UI preview.',
  },
  {
    id: 'DEMO-1025-002',
    currency: 'THB',
    methodId: 'thai_qr',
    amount: 20000,
    date: '2026-10-25',
    time: '14:15',
    status: 'approved',
    note: 'Demo notice for UI preview.',
  },
  {
    id: 'DEMO-1024-003',
    currency: 'THB',
    methodId: 'thai_bank',
    amount: 5000,
    date: '2026-10-24',
    time: '09:45',
    status: 'needs_info',
    note: 'Demo: additional information requested.',
  },
  {
    id: 'DEMO-1023-004',
    currency: 'THB',
    methodId: 'thai_qr',
    amount: 2500,
    date: '2026-10-23',
    time: '16:20',
    status: 'rejected',
    note: 'Demo notice for UI preview.',
  },
  {
    id: 'DEMO-1022-005',
    currency: 'CNY',
    methodId: 'wechat',
    amount: 1000,
    date: '2026-10-22',
    time: '11:05',
    status: 'approved',
    note: 'Demo notice for UI preview.',
  },
  {
    id: 'DEMO-1021-006',
    currency: 'USD',
    methodId: 'grey',
    amount: 200,
    date: '2026-10-21',
    time: '08:10',
    status: 'pending',
    note: 'Demo notice for UI preview.',
  },
];
