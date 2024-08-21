import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { paymentHistory } from 'src/schema/paymentHistory';

@Injectable()
export class PaymentHistoryService {
  constructor(private db: PostgresJsDatabase) {}

  async createPaymentHistory(paymentData: typeof paymentHistory.$inferInsert) {
    const [newPayment] = await this.db
      .insert(paymentHistory)
      .values(paymentData)
      .returning();
    return newPayment;
  }

  async getPaymentHistoryById(id: number) {
    const [payment] = await this.db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.id, id))
      .limit(1);
    return payment;
  }

  async getPaymentHistoryByReservationId(reservationId: number) {
    const [payment] = await this.db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.reservationId, reservationId))
      .limit(1);
    return payment;
  }

  async getAllPaymentHistories() {
    return this.db.select().from(paymentHistory);
  }

  async updatePaymentHistory(
    id: number,
    updateData: Partial<typeof paymentHistory.$inferInsert>,
  ) {
    const [updatedPayment] = await this.db
      .update(paymentHistory)
      .set(updateData)
      .where(eq(paymentHistory.id, id))
      .returning();
    return updatedPayment;
  }

  async deletePaymentHistory(id: number) {
    const [deletedPayment] = await this.db
      .delete(paymentHistory)
      .where(eq(paymentHistory.id, id))
      .returning();
    return deletedPayment;
  }
}
