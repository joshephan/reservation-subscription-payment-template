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
import { AdminAuthGuard } from 'src/auth/admin.guard';
import { Public } from 'src/auth/public.decorator';
import { hotel } from 'src/schema/hotel';
import { hotelImage } from 'src/schema/hotelImage';
import { HotelService } from 'src/service/hotel';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  async createHotel(
    @Request() req,
    @Body() hotelData: typeof hotel.$inferInsert,
    @Body()
    hotelImages?: Omit<typeof hotelImage.$inferInsert, 'id' | 'createdAt'> &
      {
        hotelId: number;
        imageUrl: string;
        isPrimary: number;
        file: File;
      }[],
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can create hotels');
    }
    return this.hotelService.createHotel(hotelData, hotelImages);
  }

  @Public()
  @Get(':id')
  async getHotelById(@Param('id') id: number) {
    return this.hotelService.getHotelById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Put(':id')
  async updateHotel(
    @Request() req,
    @Param('id') id: number,
    @Body() updateData: Partial<typeof hotel.$inferInsert>,
    @Body()
    hotelImages?: Omit<typeof hotelImage.$inferInsert, 'id' | 'createdAt'> &
      {
        hotelId: number;
        imageUrl: string;
        isPrimary: number;
        file: File;
      }[],
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can update hotels');
    }
    return this.hotelService.updateHotel(id, updateData, hotelImages);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  async deleteHotel(@Request() req, @Param('id') id: number) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can delete hotels');
    }
    return this.hotelService.deleteHotel(id);
  }

  @Public()
  @Get()
  async getAllHotels(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.hotelService.getAllHotels(page, limit);
  }

  @Public()
  @Get('search')
  async searchHotels(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.hotelService.searchHotels(query, page, limit);
  }

  @UseGuards(AdminAuthGuard)
  @Put(':id/soft-delete')
  async softDeleteHotel(
    @Request() req,
    @Param('id') id: number,
    @Body('deleteReason') deleteReason: string,
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can soft delete hotels');
    }
    return this.hotelService.softDeleteHotel(id, deleteReason, req.user.id);
  }
}
