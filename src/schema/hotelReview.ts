import {
  serial,
  integer,
  text,
  decimal,
  timestamp,
  pgTable,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { hotel } from './hotel';
import { reservation } from './reservation';
import { admin } from './admin';

export const hotelReview = pgTable('hotel_review', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  hotelId: integer('hotel_id')
    .notNull()
    .references(() => hotel.id),
  reservationId: integer('reservation_id')
    .notNull()
    .references(() => reservation.id), // 예약 정보 방에 정보 join된 상태
  rating: decimal('rating', { precision: 2, scale: 1 }).notNull(), // Rating from 0.0 to 5.0
  title: text('title').notNull(), // 제목
  content: text('content').notNull(), // 리뷰 내용
  pros: text('pros'), // 장점
  cons: text('cons'), // 단점
  stayDate: timestamp('stay_date').notNull(), // 머문 기간
  isVerified: integer('is_verified').default(0), // 0: not verified, 1: verified
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at').default(null), // 프로덕션 가시성 제한, 일정 기간 후 삭제
  deleteReason: text('delete_reason'),
  deletedByAdminId: serial('deleted_by_admin_id').references(() => admin.id),
});

export const hotelReviewRelations = relations(hotelReview, ({ one }) => ({
  user: one(user, {
    fields: [hotelReview.userId],
    references: [user.id],
  }),
  hotel: one(hotel, {
    fields: [hotelReview.hotelId],
    references: [hotel.id],
  }),
  reservation: one(reservation, {
    fields: [hotelReview.reservationId],
    references: [reservation.id],
  }),
  admin: one(admin, {
    fields: [hotelReview.deletedByAdminId],
    references: [admin.id],
  }),
}));
