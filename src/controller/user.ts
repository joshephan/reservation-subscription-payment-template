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
import { AdminGuard, JwtAuthGuard } from 'src/auth/guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Request() req,
    @Param('id') id: number,
    @Body() userData: any,
  ) {
    if (req.user.id !== id) {
      throw new Error('본인 정보만 수정 가능함');
    }
    return this.userService.updateUser(id, userData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async softDeleteUserHimself(@Request() req, @Param('id') id: number) {
    if (req.user.id !== id) {
      throw new Error('본인만 삭제가 가능하다');
    }
    return this.userService.softDeleteUserHimself(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  async softDeleteByAdmin(
    @Request() req,
    @Param('id') id: number,
    @Body('reason') reason: string,
  ) {
    return this.userService.softDeleteByAdmin(id, req.user.id, reason);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
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
