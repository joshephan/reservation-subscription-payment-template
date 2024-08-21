import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { hotelReviewReply } from 'src/schema/hotelReviewReply';
import { hotelManager } from 'src/schema/hotelManager';

@Injectable()
export class HotelReviewReplyService {
  constructor(private db: PostgresJsDatabase) {}

  async createHotelReviewReply(
    replyData: typeof hotelReviewReply.$inferInsert,
  ) {
    if (
      !replyData.hotelReviewId ||
      !replyData.content ||
      !replyData.hotelManagerId
    ) {
      throw new Error('Missing required reply data');
    }

    if (replyData.content.length < 10 || replyData.content.length > 1000) {
      throw new Error('Content must be between 10 and 1000 characters');
    }

    return this.db.insert(hotelReviewReply).values(replyData).returning();
  }

  async getHotelReviewReplyById(id: number) {
    const [result] = await this.db
      .select()
      .from(hotelReviewReply)
      .leftJoin(
        hotelManager,
        eq(hotelReviewReply.hotelManagerId, hotelManager.id),
      )
      .where(eq(hotelReviewReply.id, id))
      .limit(1);

    return result;
  }

  async updateHotelReviewReply(
    id: number,
    replyData: Partial<typeof hotelReviewReply.$inferInsert>,
  ) {
    return this.db
      .update(hotelReviewReply)
      .set({ ...replyData, updatedAt: new Date() } as Partial<
        typeof hotelReviewReply.$inferInsert
      >)
      .where(eq(hotelReviewReply.id, id))
      .returning();
  }

  async deleteHotelReviewReply(id: number) {
    return this.db
      .delete(hotelReviewReply)
      .where(eq(hotelReviewReply.id, id))
      .returning();
  }

  async getHotelReviewRepliesByReviewId(reviewId: number) {
    return this.db
      .select()
      .from(hotelReviewReply)
      .where(eq(hotelReviewReply.hotelReviewId, reviewId));
  }

  async getHotelReviewRepliesByManagerId(managerId: number) {
    return this.db
      .select()
      .from(hotelReviewReply)
      .where(eq(hotelReviewReply.hotelManagerId, managerId));
  }
}
