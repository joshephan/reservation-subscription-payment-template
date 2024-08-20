import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { hotelRoom } from 'src/schema/hotelRoom';

@Injectable()
export class HotelRoomService {
  constructor(private db: PostgresJsDatabase) {}

  async createHotelRoom(roomData: typeof hotelRoom.$inferInsert) {
    return this.db.insert(hotelRoom).values(roomData).returning();
  }

  async getHotelRoomById(id: number) {
    return this.db
      .select()
      .from(hotelRoom)
      .where(eq(hotelRoom.id, id))
      .limit(1);
  }

  async updateHotelRoom(
    id: number,
    roomData: Partial<typeof hotelRoom.$inferInsert>,
  ) {
    return this.db
      .update(hotelRoom)
      .set({ ...roomData, updatedAt: new Date() } as Partial<
        typeof hotelRoom.$inferInsert
      >)
      .where(eq(hotelRoom.id, id))
      .returning();
  }

  async deleteHotelRoom(id: number) {
    return this.db.delete(hotelRoom).where(eq(hotelRoom.id, id)).returning();
  }

  async getAllHotelRooms() {
    return this.db.select().from(hotelRoom);
  }

  async getHotelRoomsByHotelId(hotelId: number) {
    return this.db
      .select()
      .from(hotelRoom)
      .where(eq(hotelRoom.hotelId, hotelId));
  }

  async getAvailableHotelRooms() {
    return this.db.select().from(hotelRoom).where(eq(hotelRoom.isAvailable, 1));
  }

  async updateHotelRoomAvailability(id: number, isAvailable: number) {
    return this.db
      .update(hotelRoom)
      .set({ isAvailable, updatedAt: new Date() } as Partial<
        typeof hotelRoom.$inferInsert
      >)
      .where(eq(hotelRoom.id, id))
      .returning();
  }
}
