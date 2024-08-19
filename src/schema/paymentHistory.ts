import {
  serial,
  integer,
  decimal,
  timestamp,
  text,
  pgTable,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { reservation } from './reservation';

export const paymentHistory = pgTable('payment_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id), // 구매자 아이디
  reservationId: integer('reservation_id').references(() => reservation.id), // 예약 아이디
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentType: text('payment_type').notNull(), // 예약:'reservation', 입금:'deposit', 환불:'refund'
  status: text('status').notNull(), // 완료:'completed', 대기:'pending', 실패:'failed', 환불: 'refunded'
  transactionId: text('transaction_id'), // 결제 아이디, 포트원에서 제공하는 imp_uid
  paymentMethod: text('payment_method'), // 결제 방법, 카드:'card', 토스:'toss', 네이버페이:'naverpay'
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
}));
