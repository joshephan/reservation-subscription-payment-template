import { serial, integer, text, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { hotelReview } from './hotelReview';

export const reviewImage = pgTable('review_image', {
  id: serial('id').primaryKey(),
  hotelReviewId: integer('hotel_review_id')
    .notNull()
    .references(() => hotelReview.id),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  order: integer('order').default(0), // Lower values will be displayed first
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reviewImageRelations = relations(reviewImage, ({ one }) => ({
  hotelReview: one(hotelReview, {
    fields: [reviewImage.hotelReviewId],
    references: [hotelReview.id],
  }),
}));
