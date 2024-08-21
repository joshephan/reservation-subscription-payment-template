import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { desc, eq, and, gte, lte, or, isNull } from 'drizzle-orm';
import { hotelRoom } from 'src/schema/hotelRoom';
import { roomImage } from 'src/schema/roomImage';
import { reservation } from 'src/schema/reservation';

@Injectable()
export class HotelRoomService {
  constructor(private db: PostgresJsDatabase) {}

  async createHotelRoom(
    roomData: typeof hotelRoom.$inferInsert,
    roomImages?: (typeof roomImage.$inferInsert)[],
  ) {
    // Validate required fields
    if (
      !roomData.hotelId ||
      !roomData.roomNumber ||
      !roomData.roomType ||
      !roomData.capacity ||
      !roomData.pricePerNight
    ) {
      throw new Error('Missing required room data');
    }

    // Validate room number
    if (roomData.roomNumber.length < 1 || roomData.roomNumber.length > 10) {
      throw new Error('Room number must be between 1 and 10 characters');
    }

    // Validate room type
    if (roomData.roomType.length < 2 || roomData.roomType.length > 50) {
      throw new Error('Room type must be between 2 and 50 characters');
    }

    // Validate capacity
    if (roomData.capacity < 1 || roomData.capacity > 20) {
      throw new Error('Room capacity must be between 1 and 20');
    }

    // Validate price
    if (roomData.pricePerNight <= 0) {
      throw new Error('Price per night must be greater than 0');
    }

    // Set default values if not provided
    const defaultRoomData = {
      isAvailable: 1,
      updatedAt: new Date(),
    };

    // Merge the provided roomData with default values
    const completeRoomData = { ...defaultRoomData, ...roomData };

    const [insertedRoom] = await this.db
      .insert(hotelRoom)
      .values(completeRoomData)
      .returning();

    if (roomImages && roomImages.length > 0) {
      await this.db.insert(roomImage).values(
        roomImages.map((image) => ({
          ...image,
          hotelRoomId: insertedRoom.id,
        })),
      );
    }

    return insertedRoom;
  }

  async getHotelRoomById(id: number) {
    return this.db
      .select()
      .from(hotelRoom)
      .leftJoin(roomImage, eq(hotelRoom.id, roomImage.hotelRoomId))
      .where(eq(hotelRoom.id, id))
      .limit(1);
  }

  async updateHotelRoom(
    id: number,
    roomData: Partial<typeof hotelRoom.$inferInsert>,
    roomImages?: (typeof roomImage.$inferInsert)[],
  ) {
    return await this.db.transaction(async (tx) => {
      const [updatedRoom] = await tx
        .update(hotelRoom)
        .set({ ...roomData, updatedAt: new Date() } as Partial<
          typeof hotelRoom.$inferInsert
        >)
        .where(eq(hotelRoom.id, id))
        .returning();

      if (roomImages && roomImages.length > 0) {
        await tx.delete(roomImage).where(eq(roomImage.hotelRoomId, id));
        await tx.insert(roomImage).values(
          roomImages.map((image) => ({
            ...image,
            hotelRoomId: updatedRoom.id,
          })),
        );
      }

      return updatedRoom;
    });
  }

  async deleteHotelRoom(id: number) {
    return await this.db.transaction(async (tx) => {
      await tx.delete(roomImage).where(eq(roomImage.hotelRoomId, id));
      await tx.delete(hotelRoom).where(eq(hotelRoom.id, id)).returning();
    });
  }

  async getAllHotelRooms(page: number, limit: number) {
    return this.db
      .select()
      .from(hotelRoom)
      .limit(limit)
      .offset((page - 1) * limit)
      .leftJoin(roomImage, eq(hotelRoom.id, roomImage.hotelRoomId))
      .orderBy(desc(hotelRoom.id));
  }

  /**
   * 하나의 호텔 방 정보를 가져옵니다.
   * 일반적으로 하나의 호텔에 방 타입은 10개 미만이므로 페이지 구성은 넣지 않음
   * @returns 하나의 호텔 방 정보
   */
  async getHotelRoomsByHotelId(hotelId: number) {
    return this.db
      .select()
      .from(hotelRoom)
      .leftJoin(roomImage, eq(hotelRoom.id, roomImage.hotelRoomId))
      .where(eq(hotelRoom.hotelId, hotelId));
  }

  async getAvailableRoomsFromDate(
    checkInDate: Date,
    checkOutDate: Date,
    capacity: number,
  ) {
    return this.db
      .select()
      .from(hotelRoom)
      .leftJoin(
        reservation,
        and(
          eq(hotelRoom.id, reservation.hotelRoomId),
          or(
            and(
              lte(reservation.checkInDate, checkInDate),
              gte(reservation.checkOutDate, checkInDate),
            ),
            and(
              lte(reservation.checkInDate, checkOutDate),
              gte(reservation.checkOutDate, checkOutDate),
            ),
            and(
              gte(reservation.checkInDate, checkInDate),
              lte(reservation.checkOutDate, checkOutDate),
            ),
          ),
          eq(reservation.status, 'RESERVED'),
        ),
      )
      .where(
        and(
          eq(hotelRoom.isAvailable, 1),
          gte(hotelRoom.capacity, capacity),
          isNull(reservation.id),
        ),
      );
  }

  async getAvailableHotelRooms(page: number, limit: number) {
    return this.db
      .select()
      .from(hotelRoom)
      .leftJoin(roomImage, eq(hotelRoom.id, roomImage.hotelRoomId))
      .where(eq(hotelRoom.isAvailable, 1))
      .limit(limit)
      .offset((page - 1) * limit);
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
