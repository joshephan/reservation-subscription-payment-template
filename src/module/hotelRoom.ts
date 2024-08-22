import { HotelRoomController } from 'src/controller/hotelRoom';
import { HotelRoomService } from 'src/service/hotelRoom';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [HotelRoomController],
  providers: [HotelRoomService],
})
export class HotelRoomModule {}
