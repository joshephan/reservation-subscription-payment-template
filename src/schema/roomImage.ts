import { serial, text, integer, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { hotelRoom } from './hotelRoom';

export const roomImage = pgTable('room_image', {
  id: serial('id').primaryKey(),
  hotelRoomId: integer('hotel_room_id')
    .notNull()
    .references(() => hotelRoom.id),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  isPrimary: integer('is_primary').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

export const roomImageRelations = relations(roomImage, ({ one }) => ({
  hotelRoom: one(hotelRoom, {
    fields: [roomImage.hotelRoomId],
    references: [hotelRoom.id],
  }),
}));
