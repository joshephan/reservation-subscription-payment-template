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
import { JwtAuthGuard } from 'src/auth/guard';
import { hotelManager } from 'src/schema/hotelManager';
import { HotelManagerService } from 'src/service/hotelManger';

@Controller('hotel-managers')
export class HotelManagerController {
  constructor(private readonly hotelManagerService: HotelManagerService) {}

  @Post()
  async createHotelManager(
    @Body() managerData: typeof hotelManager.$inferInsert,
  ) {
    return this.hotelManagerService.createHotelManager(managerData);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getHotelManagerById(@Request() req, @Param('id') id: number) {
    if (req.user.id === id || !req.user.isAdmin) {
      throw new Error('Only administrators can view hotel manager details');
    }
    return this.hotelManagerService.getHotelManagerById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateHotelManager(
    @Request() req,
    @Param('id') id: number,
    @Body() updateData: Partial<typeof hotelManager.$inferInsert>,
  ) {
    if (req.user.id === id || !req.user.isAdmin) {
      throw new Error('Only administrators can update hotel managers');
    }
    return this.hotelManagerService.updateHotelManager(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteHotelManager(@Request() req, @Param('id') id: number) {
    if (req.user.id === id || !req.user.isAdmin) {
      throw new Error('Only administrators can delete hotel managers');
    }
    return this.hotelManagerService.deleteHotelManager(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllHotelManagers(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can view all hotel managers');
    }
    return this.hotelManagerService.getAllHotelManagers(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('hotel/:hotelId')
  async getHotelManagersByHotelId(
    @Request() req,
    @Param('hotelId') hotelId: number,
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can view hotel managers by hotel');
    }
    return this.hotelManagerService.getHotelManagerById(hotelId);
  }
}
