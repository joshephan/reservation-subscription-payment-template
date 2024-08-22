import { HotelController } from 'src/controller/hotel';
import { HotelService } from 'src/service/hotel';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
