import { pgEnum, pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const subscriptionPlanType = pgEnum('subscription_plan_type', [
  'basic',
  'business',
  'premium',
]);

export const subscriptionType = pgTable('subscription_type', {
  id: serial('id').primaryKey(),
  type: subscriptionPlanType('type').notNull(),
  price: integer('price').notNull(),
  description: text('description').notNull(),
});
