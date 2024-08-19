import {
  serial,
  text,
  integer,
  decimal,
  timestamp,
  pgTable,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { hotel } from './hotel';

export const hotelRoom = pgTable('hotel_room', {
  id: serial('id').primaryKey(),
  hotelId: integer('hotel_id')
    .notNull()
    .references(() => hotel.id), // 호텔 아이디
  roomNumber: text('room_number').notNull(), // 방 번호
  roomType: text('room_type').notNull(), // 싱글 베드, 더블 베드...
  capacity: integer('capacity').notNull(), // 수용 인원
  pricePerNight: decimal('price_per_night', {
    precision: 10,
    scale: 2,
  }).notNull(), // 가격
  description: text('description'), // 방 설명
  amenities: text('amenities'), // 방 편의시설
  isAvailable: integer('is_available').default(1), // 방 상태
  createdAt: timestamp('created_at').defaultNow(), // 방 생성 시간
  updatedAt: timestamp('updated_at').defaultNow(), // 방 수정 시간
});

export const hotelRoomRelations = relations(hotelRoom, ({ one }) => ({
  hotel: one(hotel, {
    fields: [hotelRoom.hotelId],
    references: [hotel.id],
  }),
}));
