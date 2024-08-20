import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { hotel } from '../schema/hotel';
import { hotelImage } from 'src/schema/hotelImage';

@Injectable()
export class HotelService {
  constructor(private db: PostgresJsDatabase) {}

  /**
   * 호텔 생성
   * @param hotelData 호텔 데이터
   * @returns 생성된 호텔 데이터
   */
  async createHotel(
    hotelData: Omit<typeof hotel.$inferInsert, 'id' | 'createdAt'>,
    hotelImages?: Omit<typeof hotelImage.$inferInsert, 'id' | 'createdAt'>[],
  ) {
    const result = await this.db.insert(hotel).values(hotelData).returning();

    let hotelImageResult: (typeof hotelImage.$inferInsert)[] = [];
    if (hotelImages) {
      hotelImageResult = await this.db
        .insert(hotelImage)
        .values(
          hotelImages.map((el, idx) => ({
            ...el,
            hotelId: result[0].id,
            isPrimary: idx,
          })),
        )
        .returning();
    }

    return { ...result[0], hotelImages: hotelImageResult };
  }

  async getHotelById(id: number) {
    return this.db
      .select()
      .from(hotel)
      .where(eq(hotel.id, id))
      .limit(1)
      .leftJoin(hotelImage, eq(hotel.id, hotelImage.hotelId));
  }

  async updateHotel(
    id: number,
    hotelData: Partial<typeof hotel.$inferInsert>,
    hotelImages?: Omit<typeof hotelImage.$inferInsert, 'id' | 'createdAt'>[],
  ) {
    const result = await this.db
      .update(hotel)
      .set({ ...hotelData, updatedAt: new Date() })
      .where(eq(hotel.id, id))
      .returning();

    if (hotelImages) {
      await this.db.delete(hotelImage).where(eq(hotelImage.hotelId, id));
      await this.db
        .insert(hotelImage)
        .values(
          hotelImages.map((el, idx) => ({
            ...el,
            hotelId: id,
            isPrimary: idx,
          })),
        )
        .returning();
    }

    return result[0];
  }

  async deleteHotel(id: number) {
    const result = await this.db
      .delete(hotel)
      .where(eq(hotel.id, id))
      .returning();
    return result[0];
  }

  async getAllHotels() {
    return this.db.select().from(hotel);
  }

  async getHotelsByCity(city: string) {
    return this.db.select().from(hotel).where(eq(hotel.city, city));
  }

  async getActiveHotels() {
    return this.db.select().from(hotel).where(eq(hotel.isActive, 1));
  }

  async updateHotelStatus(id: number, isActive: number) {
    const result = await this.db
      .update(hotel)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(hotel.id, id))
      .returning();
    return result[0];
  }
}
