import { ReservationController } from 'src/controller/reservation';
import { ReservationService } from 'src/service/reservation';
import { Module } from '@nestjs/common';
import { PortOneService } from 'src/service/portone';
import { PaymentHistoryService } from 'src/service/paymentHistory';

@Module({
  imports: [],
  controllers: [ReservationController],
  providers: [ReservationService, PaymentHistoryService, PortOneService],
})
export class ReservationModule {}
