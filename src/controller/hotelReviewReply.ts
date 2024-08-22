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
} from '@nestjs/common';
import { HotelReviewReplyService } from '../service/hotelReviewReply';
import { hotelReviewReply } from 'src/schema/hotelReviewReply';
import { HotelManagerAuthGuard } from 'src/auth/hotelManager.guard';
import { Public } from 'src/auth/public.decorator';

@Controller('hotel-review-replies')
export class HotelReviewReplyController {
  constructor(
    private readonly hotelReviewReplyService: HotelReviewReplyService,
  ) {}

  @UseGuards(HotelManagerAuthGuard)
  @Post()
  async createHotelReviewReply(
    @Request() req,
    @Body() replyData: typeof hotelReviewReply.$inferInsert,
  ) {
    if (req.user.isAdmin) {
      throw new Error('관리자는 리뷰 답변을 작성할 수 없습니다.');
    }
    replyData.hotelManagerId = req.user.id;
    return this.hotelReviewReplyService.createHotelReviewReply(replyData);
  }

  @Public()
  @Get(':id')
  async getHotelReviewReplyById(@Param('id') id: number) {
    return this.hotelReviewReplyService.getHotelReviewReplyById(id);
  }

  @UseGuards(HotelManagerAuthGuard)
  @Put(':id')
  async updateHotelReviewReply(
    @Request() req,
    @Param('id') id: number,
    @Body() updateData: Partial<typeof hotelReviewReply.$inferInsert>,
  ) {
    const reply =
      await this.hotelReviewReplyService.getHotelReviewReplyById(id);
    if (reply.hotel_manager.id !== req.user.id && !req.user.isAdmin) {
      throw new Error('You are not authorized to update this reply');
    }
    return this.hotelReviewReplyService.updateHotelReviewReply(id, updateData);
  }

  @UseGuards(HotelManagerAuthGuard)
  @Delete(':id')
  async deleteHotelReviewReply(@Request() req, @Param('id') id: number) {
    const reply =
      await this.hotelReviewReplyService.getHotelReviewReplyById(id);
    if (reply.hotel_manager.id !== req.user.id && !req.user.isAdmin) {
      throw new Error('You are not authorized to delete this reply');
    }
    return this.hotelReviewReplyService.deleteHotelReviewReply(id);
  }

  @Public()
  @Get('review/:reviewId')
  async getHotelReviewRepliesByReviewId(@Param('reviewId') reviewId: number) {
    return this.hotelReviewReplyService.getHotelReviewRepliesByReviewId(
      reviewId,
    );
  }
}
