import { Module } from '@nestjs/common';
import { jwtConstants } from 'src/auth/constants';
import { UserController } from 'src/controller/user';
import { UserService } from 'src/service/user';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
