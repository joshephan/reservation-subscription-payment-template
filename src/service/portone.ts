/**
 * 포트원 SDK를 사용해서 서비스 레벨을 구축
 * 내부적으로만 사용되는 서비스 파일
 */

import { Injectable } from '@nestjs/common';
import { requestPayment } from '@portone/browser-sdk';
import { Currency, PayMethod } from '@portone/browser-sdk/dist/v2/entity';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import randomstring from 'randomstring';
import {
  BillingKeyPaymentInput,
  IdentityVerificationVerifiedCustomer,
} from 'src/types';

@Injectable()
export class PortOneService {
  private readonly storeId = process.env.PORTONE_STORE_ID;
  private readonly apiSecret = process.env.PORTONE_API_SECRET;
  private readonly portoneUrl = 'https://api.portone.io';
  constructor(private readonly db: PostgresJsDatabase) {}

  /**
   * 일회성 결제
   * @param param0
   * @returns
   */
  async oneTimePayment({
    orderName,
    amount,
    payMethod,
  }: {
    orderName: string;
    amount: number;
    payMethod: PayMethod;
  }) {
    const response = await requestPayment({
      storeId: this.storeId,
      paymentId: `${randomstring.generate(10)}-${new Date().getTime().toString()}`,
      orderName,
      totalAmount: amount,
      isTestChannel: process.env.NODE_ENV === 'development',
      currency: Currency.KRW,
      payMethod,
    });

    return response;
  }

  // 예약 결제 빌링키
  // 사용자마다 빌링키를 만들어주어야 이걸 바탕으로 예약 결제가 가능
  // 최초에 결제를 할 때 빌링키를 만들어주고 이후에는 빌링키를 사용해서 결제를 진행
  // 해당 데이터는 사용자(고객)는 볼 수 없음
  async createBillingKey(method: IdentityVerificationVerifiedCustomer) {
    const response = await fetch(`${this.portoneUrl}/billing-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `PortOne ${this.apiSecret}`,
      },
      body: JSON.stringify(method),
    });

    return response;
  }

  // 구독 결제
  // 1. 예약 결제 생성(생성 시점?)
  // 2. 결제일에 도착하면 결제 진행(포트원 + PG사)
  // 3. 결제 성공 > 설정한 웹훅 Endpoint URL로 결과가 전송
  // 4. 결과 수신 Post listener > 결과 확인 후 처리
  // 5-1. 구독 갱신에 문제가 있다면 결제 취소
  // 5-1-1. 알림 메시지(결제가 안됐습니다 문자 전송)
  // 5-1-2. 며칠 후에 다시 결제 시도(예약 결제 다시 만들어준다)
  // 5-2. 구독 갱신에 문제가 없다면 구독 갱신(createSchedule)

  async getBillingKey(billingKey: string) {
    const response = await fetch(
      `${this.portoneUrl}/billing-keys/${billingKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `PortOne ${this.apiSecret}`,
        },
      },
    );

    return response;
  }

  /**
   * 예약 결제를 생성하는 함수
   * @param paymentId 결제 ID
   * @param payload 결제 데이터
   * @returns
   */
  async createSchedule(paymentId: string, payload: BillingKeyPaymentInput) {
    const response = await fetch(
      `${this.portoneUrl}/payments/${paymentId}/schedule`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `PortOne ${this.apiSecret}`,
        },
        body: JSON.stringify(payload),
      },
    );

    return response;
  }

  /**
   * 결제 취소
   * @param paymentId 결제 ID
   * @param reason 결제 취소 사유 : 에러인 경우에 환불한다면 '시스템 에러' 또는 실제 취소 사유
   */
  async cancelPayment(
    paymentId: string,
    amount?: number,
    taxFreeAmount?: number,
    vatAmount?: number,
    reason?: string,
  ) {
    const response = await fetch(
      `${this.portoneUrl}/payments/${paymentId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `PortOne ${this.apiSecret}`,
        },
        body: JSON.stringify({
          storeId: this.storeId,
          amount,
          taxFreeAmount,
          vatAmount,
          reason,
        }),
      },
    );

    return response;
  }
}
