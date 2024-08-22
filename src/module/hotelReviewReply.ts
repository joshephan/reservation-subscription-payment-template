import { HotelReviewReplyController } from 'src/controller/hotelReviewReply';
import { HotelReviewReplyService } from 'src/service/hotelReviewReply';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [HotelReviewReplyController],
  providers: [HotelReviewReplyService],
})
export class HotelReviewReplyModule {}
