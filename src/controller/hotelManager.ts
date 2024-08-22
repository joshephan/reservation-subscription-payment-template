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
import { HotelManagerAuthGuard } from 'src/auth/hotelManager.guard';
import { Public } from 'src/auth/public.decorator';
import { hotelManager } from 'src/schema/hotelManager';
import { HotelManagerService } from 'src/service/hotelManager';

@Controller('hotel-managers')
export class HotelManagerController {
  constructor(private readonly hotelManagerService: HotelManagerService) {}

  @Public()
  @Post('login')
  login(@Body() loginData: { email: string; password: string }) {
    return this.hotelManagerService.login(loginData.email, loginData.password);
  }

  @UseGuards(HotelManagerAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post()
  async createHotelManager(
    @Body() managerData: typeof hotelManager.$inferInsert,
  ) {
    return this.hotelManagerService.createHotelManager(managerData);
  }

  @UseGuards(HotelManagerAuthGuard)
  @Get(':id')
  async getHotelManagerById(@Request() req, @Param('id') id: number) {
    if (req.user.id === id || !req.user.isAdmin) {
      throw new Error('Only administrators can view hotel manager details');
    }
    return this.hotelManagerService.getHotelManagerById(id);
  }

  @UseGuards(HotelManagerAuthGuard)
  @Put(':id')
  async updateHotelManager(
    @Request() req,
    @Param('id') id: number,
    @Body() updateData: Partial<typeof hotelManager.$inferInsert>,
    @Body() profileImage?: File,
  ) {
    if (req.user.id === id || !req.user.isAdmin) {
      throw new Error('Only administrators can update hotel managers');
    }
    return this.hotelManagerService.updateHotelManager(
      id,
      updateData,
      profileImage,
    );
  }

  @UseGuards(HotelManagerAuthGuard)
  @Delete(':id')
  async deleteHotelManager(@Request() req, @Param('id') id: number) {
    if (req.user.id === id || !req.user.isAdmin) {
      throw new Error('Only administrators can delete hotel managers');
    }
    return this.hotelManagerService.deleteHotelManager(id);
  }

  @UseGuards(HotelManagerAuthGuard)
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

  @UseGuards(HotelManagerAuthGuard)
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
