import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, gte, lte, or, ne } from 'drizzle-orm';
import { reservation } from 'src/schema/reservation';

@Injectable()
export class ReservationService {
  constructor(private db: PostgresJsDatabase) {}

  async createReservation(reservationData: typeof reservation.$inferInsert) {
    // Validate reservation data
    if (
      !reservationData.userId ||
      !reservationData.hotelRoomId ||
      !reservationData.checkInDate ||
      !reservationData.checkOutDate ||
      !reservationData.numberOfGuests ||
      !reservationData.totalPrice
    ) {
      throw new Error('Missing required reservation data');
    }

    // Ensure check-in date is not in the past
    if (new Date(reservationData.checkInDate) < new Date()) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Ensure check-out date is after check-in date
    if (
      new Date(reservationData.checkOutDate) <=
      new Date(reservationData.checkInDate)
    ) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Validate number of guests
    if (reservationData.numberOfGuests < 1) {
      throw new Error('Number of guests must be at least 1');
    }

    // Validate total price
    if (reservationData.totalPrice <= 0) {
      throw new Error('Total price must be greater than 0');
    }

    // Check for overlapping reservations
    const overlappingReservations = await this.db
      .select()
      .from(reservation)
      .where(
        and(
          eq(reservation.hotelRoomId, reservationData.hotelRoomId),
          or(
            and(
              gte(reservation.checkInDate, reservationData.checkInDate),
              lte(reservation.checkInDate, reservationData.checkOutDate),
            ),
            and(
              gte(reservation.checkOutDate, reservationData.checkInDate),
              lte(reservation.checkOutDate, reservationData.checkOutDate),
            ),
          ),
          eq(reservation.status, 'RESERVED'),
        ),
      );

    if (overlappingReservations.length > 0) {
      throw new Error('The room is not available for the selected dates');
    }

    return this.db.insert(reservation).values(reservationData).returning();
  }

  async getReservationById(id: number) {
    return this.db
      .select()
      .from(reservation)
      .where(eq(reservation.id, id))
      .limit(1);
  }

  async updateReservation(
    id: number,
    reservationData: Partial<typeof reservation.$inferInsert>,
  ) {
    // Validate reservation data
    if (!reservationData.checkInDate || !reservationData.checkOutDate) {
      throw new Error('Check-in and check-out dates are required');
    }

    if (
      new Date(reservationData.checkInDate) >=
      new Date(reservationData.checkOutDate)
    ) {
      throw new Error('Check-out date must be after check-in date');
    }

    if (new Date(reservationData.checkInDate) < new Date()) {
      throw new Error('Check-in date cannot be in the past');
    }

    if (
      reservationData.numberOfGuests !== undefined &&
      reservationData.numberOfGuests < 1
    ) {
      throw new Error('Number of guests must be at least 1');
    }

    if (
      reservationData.totalPrice !== undefined &&
      reservationData.totalPrice <= 0
    ) {
      throw new Error('Total price must be greater than 0');
    }

    if (
      reservationData.status &&
      !['RESERVED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].includes(
        reservationData.status,
      )
    ) {
      throw new Error('Invalid reservation status');
    }

    // Check for overlapping reservations if dates are being updated
    if (reservationData.checkInDate || reservationData.checkOutDate) {
      const currentReservation = await this.getReservationById(id);
      if (!currentReservation.length) {
        throw new Error('Reservation not found');
      }

      const overlappingReservations = await this.db
        .select()
        .from(reservation)
        .where(
          and(
            eq(reservation.hotelRoomId, currentReservation[0].hotelRoomId),
            ne(reservation.id, id),
            or(
              and(
                gte(
                  reservation.checkInDate,
                  reservationData.checkInDate ||
                    currentReservation[0].checkInDate,
                ),
                lte(
                  reservation.checkInDate,
                  reservationData.checkOutDate ||
                    currentReservation[0].checkOutDate,
                ),
              ),
              and(
                gte(
                  reservation.checkOutDate,
                  reservationData.checkInDate ||
                    currentReservation[0].checkInDate,
                ),
                lte(
                  reservation.checkOutDate,
                  reservationData.checkOutDate ||
                    currentReservation[0].checkOutDate,
                ),
              ),
            ),
            eq(reservation.status, 'RESERVED'),
          ),
        );

      if (overlappingReservations.length > 0) {
        throw new Error('The room is not available for the selected dates');
      }
    }

    return this.db
      .update(reservation)
      .set({ ...reservationData, updatedAt: new Date() } as Partial<
        typeof reservation.$inferInsert
      >)
      .where(eq(reservation.id, id))
      .returning();
  }

  async cancelReservation(id: number) {
    // 예약 취소 시 예약 상태를 CANCELLED로 변경 + 환불 진행이 필요(src/service/portone.ts)

    return this.db
      .update(reservation)
      .set({ status: 'CANCELLED', updatedAt: new Date() } as Partial<
        typeof reservation.$inferInsert
      >)
      .where(eq(reservation.id, id))
      .returning();
  }

  async getReservationsByUserId(userId: number) {
    return this.db
      .select()
      .from(reservation)
      .where(eq(reservation.userId, userId));
  }

  async getReservationsByHotelRoomId(hotelRoomId: number) {
    return this.db
      .select()
      .from(reservation)
      .where(eq(reservation.hotelRoomId, hotelRoomId));
  }

  async checkRoomAvailability(
    hotelRoomId: number,
    checkInDate: Date,
    checkOutDate: Date,
  ) {
    const conflictingReservations = await this.db
      .select()
      .from(reservation)
      .where(
        and(
          eq(reservation.hotelRoomId, hotelRoomId),
          eq(reservation.status, 'RESERVED'),
          or(
            and(
              gte(reservation.checkInDate, checkInDate),
              lte(reservation.checkInDate, checkOutDate),
            ),
            and(
              gte(reservation.checkOutDate, checkInDate),
              lte(reservation.checkOutDate, checkOutDate),
            ),
          ),
        ),
      );

    return conflictingReservations.length === 0;
  }

  async updateReservationStatus(
    id: number,
    status: 'CHECKED_IN' | 'CHECKED_OUT',
  ) {
    return this.db
      .update(reservation)
      .set({ status, updatedAt: new Date() } as Partial<
        typeof reservation.$inferInsert
      >)
      .where(eq(reservation.id, id))
      .returning();
  }
}
