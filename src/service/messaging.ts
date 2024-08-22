import { MessageType } from 'src/types';

/**
 * 메시징 서비스
 * @description 메시징 서비스는 메시징 서비스 제공자의 API를 사용하여 메시지를 전송합니다.
 * 자세한 내용은 https://smartsms.aligo.in/admin/api/spec.html 참고
 */
export class MessagingService {
  private endpoint: string = process.env.MESSAGING_ENDPOINT;
  private apiKey: string = process.env.MESSAGING_API_KEY;
  constructor() {}

  async sendMessage({
    userId,
    message,
    sender,
    receiver,
    msgType,
    title,
    destination,
    rdate,
    rtime,
    image1,
    image2,
    image3,
  }: {
    userId: string;
    message: string;
    sender: string;
    receiver: string;
    msgType?: MessageType;
    title?: string;
    destination?: string;
    rdate?: string;
    rtime?: string;
    image1?: string;
    image2?: string;
    image3?: string;
  }) {
    const response = await fetch(`${this.endpoint}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        key: this.apiKey,
        user_id: userId,
        msg: message,
        sender,
        receiver,
        msg_type: msgType,
        title,
        destination,
        rdate,
        rtime,
        image1,
        image2,
        image3,
        testmode_yn: process.env.NODE_ENV === 'production' ? 'N' : 'Y',
      }),
    });
    return response;
  }

  async listMessage({
    userId,
    page,
    pageSize,
    startDate,
    limitDay,
  }: {
    userId: string;
    page?: number;
    pageSize?: number;
    startDate?: string;
    limitDay?: number;
  }) {
    const response = await fetch(`${this.endpoint}/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        key: this.apiKey,
        user_id: userId,
        page,
        page_size: pageSize,
        start_date: startDate,
        limit_day: limitDay,
      }),
    });
    return response;
  }
}
