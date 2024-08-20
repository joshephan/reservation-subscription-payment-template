import { serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { admin } from './admin';
import { relations } from 'drizzle-orm';

export const user = pgTable('user', {
  id: serial('id'),
  name: text('name'),
  email: text('email').unique(),
  password: text('password'), // 암호화된 비밀번호(hashed)
  phone: text('phone').unique(), // 전화번호, 숫자만 포함, 구분자(-) replace 필요, 국가번호는 제외
  profilePicture: text('profile_picture'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at').default(null), // 프로덕션 가시성 제한, 일정 기간 후 삭제
  deleteReason: text('delete_reason').default(null),
  deletedByAdminId: serial('deleted_by_admin_id').references(() => admin.id), // 관리자가 삭제한 경우
});

export const userRelations = relations(user, ({ one }) => ({
  admin: one(admin, {
    fields: [user.deletedByAdminId],
    references: [admin.id],
  }),
}));
