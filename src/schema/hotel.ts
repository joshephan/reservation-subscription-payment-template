import {
  serial,
  text,
  integer,
  decimal,
  timestamp,
  pgTable,
} from 'drizzle-orm/pg-core';

export const hotel = pgTable('hotel', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // 호텔 이름
  address: text('address').notNull(), // 호텔 주소
  city: text('city').notNull(), // 호텔 도시
  country: text('country').notNull(), // 호텔 국가
  starRating: integer('star_rating').notNull(), // 호텔 별점
  description: text('description'), // 호텔 설명
  amenities: text('amenities'), // 호텔 시설
  latitude: decimal('latitude', { precision: 10, scale: 8 }), // 호텔 위도
  longitude: decimal('longitude', { precision: 11, scale: 8 }), // 호텔 경도
  phoneNumber: text('phone_number'), // 호텔 전화번호
  email: text('email'), // 호텔 이메일
  website: text('website'), // 호텔 웹사이트
  checkInTime: text('check_in_time'), // 호텔 체크인 시간
  checkOutTime: text('check_out_time'), // 호텔 체크아웃 시간
  isActive: integer('is_active').notNull(), // 호텔 활성 상태
  createdAt: timestamp('created_at').defaultNow(), // 호텔 생성 시간
  updatedAt: timestamp('updated_at').notNull(), // 호텔 수정 시간
});
