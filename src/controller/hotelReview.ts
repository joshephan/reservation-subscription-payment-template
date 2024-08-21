import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { HotelReviewService } from '../service/hotelReview';
import { JwtAuthGuard } from 'src/auth/guard';
import { hotelReview } from 'src/schema/hotelReview';
import { reviewImage } from 'src/schema/reviewImage';

@Controller('hotel-reviews')
export class HotelReviewController {
  constructor(private readonly hotelReviewService: HotelReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createHotelReview(
    @Request() req,
    @Body()
    payload: {
      reviewData: typeof hotelReview.$inferInsert & {
        isVerified: number;
        rating: number;
      };
      reviewImages: (typeof reviewImage.$inferInsert)[];
    },
  ) {
    payload.reviewData.userId = req.user.id;
    return this.hotelReviewService.createHotelReview(
      payload.reviewData,
      payload.reviewImages,
    );
  }

  @Get(':id')
  async getHotelReviewById(@Param('id') id: number) {
    return this.hotelReviewService.getHotelReviewById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateHotelReview(
    @Request() req,
    @Param('id') id: number,
    @Body()
    updateData: Partial<typeof hotelReview.$inferInsert> & {
      pros?: string;
      cons?: string;
      isVerified?: number;
      rating?: number;
    },
  ) {
    const existingReview = await this.hotelReviewService.getHotelReviewById(id);
    if (existingReview.userId !== req.user.id && !req.user.isAdmin) {
      throw new Error('You are not authorized to update this review');
    }
    return this.hotelReviewService.updateHotelReview(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteHotelReview(@Request() req, @Param('id') id: number) {
    const existingReview = await this.hotelReviewService.getHotelReviewById(id);
    if (existingReview.userId !== req.user.id && !req.user.isAdmin) {
      throw new Error('You are not authorized to delete this review');
    }
    return this.hotelReviewService.deleteHotelReview(id);
  }

  /**
   * 호텔 리뷰를 가져옵니다.
   * @param hotelId 호텔 ID
   * @param page 페이지 번호
   * @param limit 페이지 크기
   * @returns 호텔 리뷰 목록
   * @example
   * GET /hotel-reviews/hotel/1?page=1&limit=10
   */
  @Get('hotel/:hotelId')
  async getHotelReviewsByHotelId(
    @Param('hotelId') hotelId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.hotelReviewService.getHotelReviewsByHotelId(
      hotelId,
      page,
      limit,
    );
  }

  /**
   * 유저의 리뷰를 가져옵니다.
   * @param req 요청 객체
   * @param userId 유저 ID
   * @param page 페이지 번호
   * @param limit 페이지 크기
   * @returns 유저의 리뷰 목록
   * @example
   * GET /hotel-reviews/user/1?page=1&limit=10
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getHotelReviewsByUserId(
    @Request() req,
    @Param('userId') userId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    if (req.user.id !== userId && !req.user.isAdmin) {
      throw new Error('You are not authorized to view these reviews');
    }
    return this.hotelReviewService.getHotelReviewsByUserId(userId, page, limit);
  }
}
