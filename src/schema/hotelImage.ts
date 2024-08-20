import { serial, integer, text, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { hotel } from './hotel';

export const hotelImage = pgTable('hotel_image', {
  id: serial('id').primaryKey(),
  hotelId: integer('hotel_id')
    .notNull()
    .references(() => hotel.id),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  isPrimary: integer('is_primary').notNull(), // 값이 0에 가까울 수록 먼저 표기
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const hotelImageRelations = relations(hotelImage, ({ one }) => ({
  hotel: one(hotel, {
    fields: [hotelImage.hotelId],
    references: [hotel.id],
  }),
}));
