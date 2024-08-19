import { serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

// 시스템 관리자
export const admin = pgTable('admin', {
  id: serial('id'),
  name: text('name'),
  email: text('email'),
  password: text('password'), // 암호화된 비밀번호(hashed)
  phone: text('phone'), // 전화번호, 숫자만 포함, 구분자(-) replace 필요, 국가번호는 제외
  profilePicture: text('profile_picture'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
