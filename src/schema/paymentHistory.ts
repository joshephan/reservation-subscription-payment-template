import { serial, integer, timestamp, text, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { reservation } from './reservation';
import { subscription } from './subscription';

/**
 * 결제 내역
 * 다른 서비스에 종속적인 스키마다 보니 별도의 서비스가 필요가 없을 수도 있음
 */
export const paymentHistory = pgTable('payment_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id), // 구매자 아이디
  subscriptionId: integer('subscription_id').references(() => subscription.id), // 예약 아이디
  reservationId: integer('reservation_id').references(() => reservation.id), // 예약 아이디
  amount: integer('amount').notNull(),
  paymentType: text('payment_type').notNull(), // 예약:'reservation', 입금:'deposit', 환불:'refund', 구독:'subscription'
  status: text('status').notNull(), // 완료:'completed', 대기:'pending', 실패:'failed', 환불: 'refunded'
  transactionId: text('transaction_id').notNull(), // 결제 아이디, 포트원에서 제공하는 트렌젝션 아이디
  paymentId: text('payment_id').notNull(), // 결제 아이디, 포트원에서 제공하는 결제 아이디
  paymentMethod: text('payment_method').notNull(), // 결제 방법, 카드:'card', 토스:'toss', 네이버페이:'naverpay'
  description: text('description'), // 결제 설명
  createdAt: timestamp('created_at').defaultNow(), // 결제 생성 시간
  updatedAt: timestamp('updated_at').defaultNow(), // 결제 업데이트 시간
});

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  user: one(user, {
    fields: [paymentHistory.userId],
    references: [user.id],
  }),
  reservation: one(reservation, {
    fields: [paymentHistory.reservationId],
    references: [reservation.id],
  }),
  subscription: one(subscription, {
    fields: [paymentHistory.subscriptionId],
    references: [subscription.id],
  }),
}));
