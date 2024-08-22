import { HotelReviewController } from 'src/controller/hotelReview';
import { HotelReviewService } from 'src/service/hotelReview';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [HotelReviewController],
  providers: [HotelReviewService],
})
export class HotelReviewModule {}
