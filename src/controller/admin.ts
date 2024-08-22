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
import { CreateAdminDto } from 'src/dto/admin';
import { AdminService } from 'src/service/admin';
import { admin } from 'src/schema/admin';
import { AdminAuthGuard } from 'src/auth/admin.guard';
import { Public } from 'src/auth/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    return this.adminService.login(loginData.email, loginData.password);
  }

  @UseGuards(AdminAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async getAdminById(@Param('id') id: number) {
    return this.adminService.getAdminById(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  async updateAdmin(
    @Param('id') id: number,
    @Body() updateAdminDto: Partial<typeof admin.$inferInsert>,
    @Body() profileImage?: File,
  ) {
    return this.adminService.updateAdmin(id, updateAdminDto, profileImage);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteAdmin(@Param('id') id: number) {
    return this.adminService.deleteAdmin(id);
  }
}
