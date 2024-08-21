import { serial, integer, text, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { hotelManager } from './hotelManager';
import { hotelReview } from './hotelReview';

export const hotelReviewReply = pgTable('hotel_review_reply', {
  id: serial('id').primaryKey(),
  hotelManagerId: integer('hotel_manager_id')
    .notNull()
    .references(() => hotelManager.id),
  hotelReviewId: integer('hotel_review_id')
    .notNull()
    .references(() => hotelReview.id),
  content: text('content').notNull(),
  isPublished: integer('is_published').default(1), // 0: draft, 1: published
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

export const hotelReviewReplyRelations = relations(
  hotelReviewReply,
  ({ one }) => ({
    hotelManager: one(hotelManager, {
      fields: [hotelReviewReply.hotelManagerId],
      references: [hotelManager.id],
    }),
    hotelReview: one(hotelReview, {
      fields: [hotelReviewReply.hotelReviewId],
      references: [hotelReview.id],
    }),
  }),
);
