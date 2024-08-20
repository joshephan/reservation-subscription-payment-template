import { serial, text, timestamp, integer, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { hotel } from './hotel';
import { admin } from './admin';

// 호텔을 관리하는 매니저
export const hotelManager = pgTable('hotel_manager', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(), // 암호화된 비밀번호(hashed)
  phone: text('phone'), // 전화번호, 숫자만 포함, 구분자(-) replace 필요, 국가번호는 제외
  hotelId: integer('hotel_id').references(() => hotel.id),
  profilePicture: text('profile_picture'),
  isActive: integer('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at').default(null), // 프로덕션 가시성 제한, 일정 기간 후 삭제
  deleteReason: text('delete_reason').default(null),
  deletedByAdminId: serial('deleted_by_admin_id').references(() => admin.id), // 관리자가 삭제한 경우
});

export const hotelManagerRelations = relations(hotelManager, ({ one }) => ({
  hotel: one(hotel, {
    fields: [hotelManager.hotelId],
    references: [hotel.id],
  }),
}));
