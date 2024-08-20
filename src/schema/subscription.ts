import { serial, integer, text, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { subscriptionType } from './subscriptionType';

export const subscription = pgTable('subscription', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  planType: integer('plan_type')
    .notNull()
    .references(() => subscriptionType.id), // 결제 플랜 타입 : 'basic', 'business', 'premium'
  status: text('status').notNull(), // 결제 상태 : 'active(지속적으로 결제)', 'cancelled(취소)', 'expired(결제 안되서 만료)'
  startDate: timestamp('start_date', { mode: 'date' }).notNull(), // 구독 시작 날짜
  endDate: timestamp('end_date', { mode: 'date' }).notNull(), // 구독 종료 날짜
  createdAt: timestamp('created_at').defaultNow(), // 결제를 한 시점
  updatedAt: timestamp('updated_at'), // 구독 상태의 업데이트가 발생한 시점, notNull인게 이상하긴 함
});

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
  subscriptionType: one(subscriptionType, {
    fields: [subscription.planType],
    references: [subscriptionType.id],
  }),
}));
