import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { hotelManager } from 'src/schema/hotelManager';
import { hotel } from 'src/schema/hotel';
import bcrypt from 'bcrypt';
import { SupabaseS3Service } from './s3';

@Injectable()
export class HotelManagerService {
  constructor(private db: PostgresJsDatabase) {}

  async login(email: string, password: string) {
    const [manager] = await this.getHotelManagerByEmail(email);
    if (!manager) {
      throw new Error('Manager not found');
    }

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }

    return manager;
  }

  async getHotelManagerByEmail(email: string) {
    return this.db
      .select()
      .from(hotelManager)
      .where(eq(hotelManager.email, email))
      .limit(1);
  }

  async createHotelManager(managerData: typeof hotelManager.$inferInsert) {
    return this.db.insert(hotelManager).values(managerData).returning();
  }

  async getHotelManagerById(id: number) {
    const result = await this.db
      .select()
      .from(hotelManager)
      .where(eq(hotelManager.id, id))
      .limit(1);

    return result[0];
  }

  async updateHotelManager(
    id: number,
    managerData: Partial<typeof hotelManager.$inferInsert> & {
      profilePicture?: string;
    },
    profileImage?: File,
  ) {
    const manager = await this.getHotelManagerById(id);

    if (!manager) {
      throw new Error('Manager not found');
    }
    const s3Service = new SupabaseS3Service('hotel-manager-images');

    if (manager.profilePicture && profileImage) {
      await s3Service.deleteFile(manager.profilePicture);
    }

    if (profileImage) {
      const profileImageUrl = await s3Service.uploadFile(
        profileImage,
        `hotel_manager_${id}/profile.${profileImage.type.split('/')[1]}`,
      );
      managerData.profilePicture = profileImageUrl;
    }

    return this.db
      .update(hotelManager)
      .set({ ...managerData, updatedAt: new Date() } as Partial<
        typeof hotelManager.$inferInsert
      >)
      .where(eq(hotelManager.id, id))
      .returning();
  }

  async deleteHotelManager(id: number) {
    return await this.db.transaction(async (tx) => {
      const manager = await tx
        .select()
        .from(hotelManager)
        .where(eq(hotelManager.id, id))
        .limit(1)
        .then((result) => result[0]);

      if (!manager) {
        throw new Error('Manager not found');
      }

      const deleteRequest = await tx
        .delete(hotelManager)
        .where(eq(hotelManager.id, id))
        .returning();

      if (deleteRequest.length === 0) {
        throw new Error('Manager not found');
      }

      const s3Service = new SupabaseS3Service('hotel-manager-images');
      if (manager.profilePicture) {
        await s3Service.deleteFile(manager.profilePicture);
      }

      return deleteRequest[0];
    });
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
