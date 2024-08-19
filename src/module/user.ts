import { Module } from '@nestjs/common';
import { UserController } from 'src/controller/user';
import { UserService } from 'src/service/user';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
