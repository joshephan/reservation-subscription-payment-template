import { serial, integer, timestamp, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { hotelRoom } from './hotelRoom';

export const reservation = pgTable('reservation', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  hotelRoomId: integer('hotel_room_id')
    .notNull()
    .references(() => hotelRoom.id),
  checkInDate: timestamp('check_in_date').notNull(),
  checkOutDate: timestamp('check_out_date').notNull(),
  numberOfGuests: integer('number_of_guests').notNull(),
  totalPrice: integer('total_price').notNull(),
  status: text('status')
    .notNull()
    .$type<'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

export const reservationRelations = relations(reservation, ({ one }) => ({
  user: one(user, {
    fields: [reservation.userId],
    references: [user.id],
  }),
  hotelRoom: one(hotelRoom, {
    fields: [reservation.hotelRoomId],
    references: [hotelRoom.id],
  }),
}));
