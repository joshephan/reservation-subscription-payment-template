import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { hotelManager } from 'src/schema/hotelManager';
import { hotel } from 'src/schema/hotel';

@Injectable()
export class HotelManagerService {
  constructor(private db: PostgresJsDatabase) {}
  async createHotelManager(managerData: typeof hotelManager.$inferInsert) {
    return this.db.insert(hotelManager).values(managerData).returning();
  }

  async getHotelManagerById(id: number) {
    return this.db
      .select()
      .from(hotelManager)
      .where(eq(hotelManager.id, id))
      .limit(1);
  }

  async updateHotelManager(
    id: number,
    managerData: Partial<typeof hotelManager.$inferInsert>,
  ) {
    return this.db
      .update(hotelManager)
      .set({ ...managerData, updatedAt: new Date() } as Partial<
        typeof hotelManager.$inferInsert
      >)
      .where(eq(hotelManager.id, id))
      .returning();
  }

  async deleteHotelManager(id: number) {
    return this.db
      .delete(hotelManager)
      .where(eq(hotelManager.id, id))
      .returning();
  }

  async getAllHotelManagers(page: number, limit: number) {
    return this.db
      .select()
      .from(hotelManager)
      .leftJoin(hotel, eq(hotelManager.hotelId, hotel.id))
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async softDeleteHotelManager(
    id: number,
    deleteReason: string,
    deletedByAdminId: number,
  ) {
    return this.db
      .update(hotelManager)
      .set({
        isActive: 0,
        deletedAt: new Date(),
        deleteReason,
        deletedByAdminId,
        updatedAt: new Date(),
      } as Partial<typeof hotelManager.$inferInsert>)
      .where(eq(hotelManager.id, id))
      .returning();
  }

  async getActiveHotelManagers() {
    return this.db
      .select()
      .from(hotelManager)
      .where(eq(hotelManager.isActive, 1));
  }
}
