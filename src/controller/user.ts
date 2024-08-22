import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from '../service/user';
import { UserAuthGuard } from 'src/auth/user.guard';
import { AdminAuthGuard } from 'src/auth/admin.guard';
import { Public } from 'src/auth/public.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    return this.userService.login(loginData.email, loginData.password);
  }

  @Public()
  @Post()
  async createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }

  @UseGuards(UserAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Public()
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @UseGuards(UserAuthGuard)
  @Put(':id')
  async updateUser(
    @Request() req,
    @Param('id') id: number,
    @Body() userData: any,
    @Body('profileImage') profileImage?: File,
  ) {
    if (req.user.id !== id) {
      throw new Error('본인 정보만 수정 가능함');
    }
    return this.userService.updateUser(id, userData, profileImage);
  }

  @UseGuards(UserAuthGuard)
  @Delete(':id')
  async softDeleteUserHimself(@Request() req, @Param('id') id: number) {
    if (req.user.id !== id) {
      throw new Error('본인만 삭제가 가능하다');
    }
    return this.userService.softDeleteUserHimself(id);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admin/:id')
  async softDeleteByAdmin(
    @Request() req,
    @Param('id') id: number,
    @Body('reason') reason: string,
  ) {
    return this.userService.softDeleteByAdmin(id, req.user.id, reason);
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  async getUsers(
    @Query('size') size: number = 10,
    @Query('page') page: number = 1,
    @Query('orderBy') orderBy: 'createdAt' | 'name' = 'createdAt',
    @Query('orderDirection') orderDirection: 'asc' | 'desc' = 'desc',
  ) {
    return this.userService.getUsers(size, page, orderBy, orderDirection);
  }
}
