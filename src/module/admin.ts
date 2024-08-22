import { Module } from '@nestjs/common';
import { jwtConstants } from 'src/auth/constants';
import { AdminController } from 'src/controller/admin';
import { AdminService } from 'src/service/admin';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
