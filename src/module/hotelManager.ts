import { HotelManagerController } from 'src/controller/hotelManager';
import { HotelManagerService } from 'src/service/hotelManager';
import { jwtConstants } from 'src/auth/constants';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [HotelManagerController],
  providers: [HotelManagerService],
})
export class HotelManagerModule {}
