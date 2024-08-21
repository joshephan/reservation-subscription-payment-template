import { Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, desc } from 'drizzle-orm';
import { hotelReview } from 'src/schema/hotelReview';
import { reviewImage } from 'src/schema/reviewImage';
import { hotelReviewReply } from 'src/schema/hotelReviewReply';
import { user } from 'src/schema/user';

@Injectable()
export class HotelReviewService {
  constructor(private db: PostgresJsDatabase) {}

  async createHotelReview(
    reviewData: typeof hotelReview.$inferInsert & {
      isVerified: number;
      rating: number;
    },
    reviewImages?: (typeof reviewImage.$inferInsert)[],
  ) {
    // Validate review data
    if (
      !reviewData.userId ||
      !reviewData.hotelId ||
      !reviewData.reservationId ||
      !reviewData.rating ||
      !reviewData.title ||
      !reviewData.content ||
      !reviewData.stayDate
    ) {
      throw new Error('Missing required review data');
    }

    // Validate rating
    if (reviewData.rating < 0 || reviewData.rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    // Validate stay date
    if (new Date(reviewData.stayDate) > new Date()) {
      throw new Error('Stay date cannot be in the future');
    }

    // Validate title and content length
    if (reviewData.title.length < 3 || reviewData.title.length > 100) {
      throw new Error('Title must be between 3 and 100 characters');
    }
    if (reviewData.content.length < 10 || reviewData.content.length > 1000) {
      throw new Error('Content must be between 10 and 1000 characters');
    }

    // Extend reviewData type to include isVerified
    reviewData.isVerified = reviewData.isVerified || 0; // Ensure isVerified is set
    const [insertedReview] = await this.db
      .insert(hotelReview)
      .values(reviewData)
      .returning();

    if (reviewImages && reviewImages.length > 0) {
      await this.db.insert(reviewImage).values(
        reviewImages.map((image) => ({
          ...image,
          hotelReviewId: insertedReview.id,
        })),
      );
    }

    return insertedReview;
  }

  async getHotelReviewById(id: number) {
    const [result] = await this.db
      .select()
      .from(hotelReview)
      .where(eq(hotelReview.id, id))
      .limit(1);

    return result;
  }

  /**
   * 리뷰 수정: 실제 서비스에서 리뷰 수정을 제공하지 않으므로
   * @param id 리뷰 아이디
   * @param reviewData 리뷰 데이터
   * @returns 수정된 리뷰
   */
  async updateHotelReview(
    id: number,
    reviewData: Partial<typeof hotelReview.$inferInsert> & {
      pros?: string;
      cons?: string;
      isVerified?: number;
      rating?: number;
    },
  ) {
    // Validate review data
    if (
      !reviewData.rating &&
      !reviewData.title &&
      !reviewData.content &&
      !reviewData.pros &&
      !reviewData.cons
    ) {
      throw new Error('No data provided for update');
    }

    // Validate rating if provided
    if (reviewData.rating !== undefined) {
      if (reviewData.rating < 0 || reviewData.rating > 5) {
        throw new Error('Rating must be between 0 and 5');
      }
    }

    // Validate title length if provided
    if (reviewData.title !== undefined) {
      if (reviewData.title.length < 3 || reviewData.title.length > 100) {
        throw new Error('Title must be between 3 and 100 characters');
      }
    }

    // Validate content length if provided
    if (reviewData.content !== undefined) {
      if (reviewData.content.length < 10 || reviewData.content.length > 1000) {
        throw new Error('Content must be between 10 and 1000 characters');
      }
    }

    // Validate pros and cons length if provided
    if (reviewData.pros !== undefined && reviewData.pros.length > 500) {
      throw new Error('Pros must not exceed 500 characters');
    }
    if (reviewData.cons !== undefined && reviewData.cons.length > 500) {
      throw new Error('Cons must not exceed 500 characters');
    }
    return this.db
      .update(hotelReview)
      .set({ ...reviewData, updatedAt: new Date() } as Partial<
        typeof hotelReview.$inferInsert
      >)
      .where(eq(hotelReview.id, id))
      .returning();
  }

  async deleteHotelReview(id: number) {
    // Delete the hotel review
    const deletedReview = await this.db
      .delete(hotelReview)
      .where(eq(hotelReview.id, id))
      .returning();

    // Delete associated review images
    await this.db.delete(reviewImage).where(eq(reviewImage.hotelReviewId, id));

    // Delete associated review replies
    await this.db
      .delete(hotelReviewReply)
      .where(eq(hotelReviewReply.hotelReviewId, id));

    return deletedReview;
  }

  async getHotelReviewsByHotelId(hotelId: number, page: number, limit: number) {
    return this.db
      .select()
      .from(hotelReview)
      .leftJoin(
        hotelReviewReply,
        eq(hotelReviewReply.hotelReviewId, hotelReview.id),
      )
      .leftJoin(reviewImage, eq(reviewImage.hotelReviewId, hotelReview.id))
      .leftJoin(user, eq(user.id, hotelReview.userId))
      .where(
        and(eq(hotelReview.hotelId, hotelId), eq(hotelReview.deletedAt, null)),
      )
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(desc(hotelReview.createdAt));
  }

  async getHotelReviewsByUserId(userId: number, page: number, limit: number) {
    return this.db
      .select()
      .from(hotelReview)
      .leftJoin(reviewImage, eq(reviewImage.hotelReviewId, hotelReview.id))
      .leftJoin(user, eq(user.id, hotelReview.userId))
      .where(
        and(eq(hotelReview.userId, userId), eq(hotelReview.deletedAt, null)),
      )
      .orderBy(desc(hotelReview.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async verifyHotelReview(id: number) {
    return this.db
      .update(hotelReview)
      .set({ isVerified: 1, updatedAt: new Date() } as Partial<
        typeof hotelReview.$inferInsert
      >)
      .where(eq(hotelReview.id, id))
      .returning();
  }

  async softDeleteHotelReview(
    id: number,
    deleteReason: string,
    deletedByAdminId: number,
  ) {
    return this.db
      .update(hotelReview)
      .set({
        deletedAt: new Date(),
        deleteReason,
        deletedByAdminId,
        updatedAt: new Date(),
      } as Partial<typeof hotelReview.$inferInsert>)
      .where(eq(hotelReview.id, id))
      .returning();
  }
}
