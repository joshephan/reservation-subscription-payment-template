import { SubscriptionController } from 'src/controller/subscription';
import { SubscriptionService } from 'src/service/subscription';
import { Module } from '@nestjs/common';
import { PortOneService } from 'src/service/portone';

@Module({
  imports: [],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PortOneService],
})
export class SubscriptionModule {}
