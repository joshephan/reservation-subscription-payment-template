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
import { HotelRoomService } from '../service/hotelRoom';
import { JwtAuthGuard } from 'src/auth/guard';
import { hotelRoom } from 'src/schema/hotelRoom';
import { roomImage } from 'src/schema/roomImage';

@Controller('hotel-rooms')
export class HotelRoomController {
  constructor(private readonly hotelRoomService: HotelRoomService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createHotelRoom(
    @Request() req,
    @Body()
    roomData: {
      room: typeof hotelRoom.$inferInsert;
      images?: (typeof roomImage.$inferInsert)[];
    },
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can create hotel rooms');
    }
    return this.hotelRoomService.createHotelRoom(
      roomData.room,
      roomData.images,
    );
  }

  @Get(':id')
  async getHotelRoomById(@Param('id') id: number) {
    return this.hotelRoomService.getHotelRoomById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateHotelRoom(
    @Request() req,
    @Param('id') id: number,
    @Body() updateData: Partial<typeof hotelRoom.$inferInsert>,
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can update hotel rooms');
    }
    return this.hotelRoomService.updateHotelRoom(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteHotelRoom(@Request() req, @Param('id') id: number) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can delete hotel rooms');
    }
    return this.hotelRoomService.deleteHotelRoom(id);
  }

  @Get('hotel/:hotelId')
  async getHotelRoomsByHotelId(@Param('hotelId') hotelId: number) {
    return this.hotelRoomService.getHotelRoomsByHotelId(hotelId);
  }

  /**
   * 체크인 체크아웃 날짜 선택하고, 몇 명 숙박할 건지에 대한 Get 요청
   * @param searchParams
   * @returns
   */
  @Get('available')
  async getAvailableRooms(
    @Body()
    searchParams: {
      checkInDate: Date; // check in date
      checkOutDate: Date; // check out date
      capacity: number; // capacity of the room
    },
  ) {
    return this.hotelRoomService.getAvailableRoomsFromDate(
      searchParams.checkInDate,
      searchParams.checkOutDate,
      searchParams.capacity,
    );
  }
}
