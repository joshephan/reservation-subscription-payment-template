import { Currency, Gender } from '@portone/browser-sdk/dist/v2/entity';

export type BillingKeyPaymentInput = {
  billingKey: string;
  amount: {
    total: number;
    taxFree?: number;
    vat?: number;
  };
  currency: Currency;
};

export type IdentityVerificationVerifiedCustomer = {
  name: string;
  birthDate: string;
  gender: Gender;
  ci: string;
  di: string;
};

export type MessageType = 'SMS' | 'LMS' | 'MMS';

export type MessageResponse = {
  result_code: number;
  message: string;
  msg_id: number;
  success_cnt: number;
  error_cnt: number;
  msg_type: MessageType;
};
