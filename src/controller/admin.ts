import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateAdminDto } from 'src/dto/admin';
import { AdminService } from 'src/service/admin';
import { JwtAuthGuard } from 'src/auth/guard';
import { admin } from 'src/schema/admin';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get(':id')
  async getAdminById(@Param('id') id: number) {
    return this.adminService.getAdminById(id);
  }

  @Post()
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Put(':id')
  async updateAdmin(
    @Param('id') id: number,
    @Body() updateAdminDto: Partial<typeof admin.$inferInsert>,
  ) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: number) {
    return this.adminService.deleteAdmin(id);
  }
}
