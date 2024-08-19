import { serial, integer, timestamp, pgTable } from 'drizzle-orm/pg-core';
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
  status: integer('status').default(1), // 1: 예약 완료, 2: 체크인, 3: 체크아웃, 4: 취소
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
