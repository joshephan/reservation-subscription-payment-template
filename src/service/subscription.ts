import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { adminLog } from 'src/schema/adminLog';
import { paymentHistory } from 'src/schema/paymentHistory';
import { subscription } from 'src/schema/subscription';
import { subscriptionType } from 'src/schema/subscriptionType';
import { user } from 'src/schema/user';

@Injectable()
export class SubscriptionService {
  constructor(private db: PostgresJsDatabase) {}

  async createSubscription(
    subscriptionData: Partial<typeof subscription.$inferInsert> & {
      userId: number;
      planType: number;
      updatedAt: Date;
      status: string;
      startDate: Date;
      endDate: Date;
    },
  ) {
    if (subscriptionData) {
      subscriptionData.updatedAt = new Date();
      subscriptionData.status = 'active';
      subscriptionData.startDate = new Date();
      subscriptionData.endDate = new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      );
    }
    return this.db.insert(subscription).values(subscriptionData).returning();
  }

  /**
   * 유저의 구독 정보를 가져온다. 본인 스스로 또는 관리자만 조회 가능하다.
   * @param userId
   * @returns
   */
  async getSubscriptionByUserId(userId: number) {
    return this.db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId));
  }

  /**
   * 유저의 구독 정보를 가져온다. 본인 스스로 또는 관리자만 수정 가능하다.
   * @param id
   * @param updateData
   * @returns
   */
  async updateSubscription(
    id: number,
    updateData: Partial<typeof subscription.$inferInsert> & { updatedAt: Date },
  ) {
    // 관리자만 수정했다면 > 관리자 행동 로그 별도로 저장

    updateData.updatedAt = new Date();

    return this.db
      .update(subscription)
      .set(updateData)
      .where(eq(subscription.id, id))
      .returning();
  }

  /**
   * 구독을 취소한다. 본인 스스로 또는 관리자만 취소 가능하다.
   * @param id
   * @returns
   */
  async cancelSubscription(id: number, adminId?: number) {
    // 관리자만 수정했다면 > 관리자 행동 로그 별도로 저장
    return await this.db.transaction(async (tx) => {
      // Add admin log for cancel subscription
      if (adminId) {
        await tx.insert(adminLog).values({
          adminId,
          action: 'cancel',
          targetType: 'subscription',
          targetId: id,
          details: '',
        });
      }

      const updatePayload = {
        status: 'cancelled',
        updatedAt: new Date(),
      } as Partial<typeof subscription.$inferInsert>;

      return tx
        .update(subscription)
        .set(updatePayload)
        .where(eq(subscription.id, id))
        .returning();
    });
  }

  async getAllActiveSubscriptions() {
    return this.db
      .select()
      .from(subscription)
      .innerJoin(user, eq(subscription.userId, user.id))
      .where(eq(subscription.status, 'active'));
  }

  /**
   * 구독에서 갱신이 되는 부분
   * 결제 서비스사에서 일정 주기마다 결제 webhook을 받아서 호출한다.
   * @param id
   * @param newEndDate
   * @returns
   */
  async renewSubscription(
    id: number,
    newEndDate: Date,
    paymentRecord: Partial<typeof paymentHistory.$inferInsert> & {
      subscriptionId: number;
      updatedAt: Date;
    },
  ) {
    return await this.db.transaction(async (tx) => {
      // 구독 정보 갱신
      const updatePayload = {
        endDate: newEndDate,
        updatedAt: new Date(),
      } as Partial<typeof subscription.$inferInsert>;

      const updatedSubscription = await tx
        .update(subscription)
        .set(updatePayload)
        .where(eq(subscription.id, id))
        .returning({
          user: user,
          subscriptionType: subscriptionType,
        });

      paymentRecord.subscriptionId = id;
      paymentRecord.updatedAt = new Date();

      await tx
        .insert(paymentHistory)
        .values(paymentRecord as typeof paymentHistory.$inferInsert);

      return updatedSubscription;
    });
  }
}
