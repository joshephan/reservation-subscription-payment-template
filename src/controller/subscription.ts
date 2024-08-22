import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { SubscriptionService } from '../service/subscription';
import { subscription } from 'src/schema/subscription';
import { paymentHistory } from 'src/schema/paymentHistory';
import { PortOneService } from 'src/service/portone';
import { PayMethod } from '@portone/browser-sdk/dist/v2/entity';
import { UserAuthGuard } from 'src/auth/user.guard';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly portOneService: PortOneService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Post()
  async createSubscription(
    @Request() req,
    @Body()
    payload: {
      subscriptionData: Partial<typeof subscription.$inferInsert> & {
        userId: number;
        planType: number;
        updatedAt: Date;
        status: string;
        startDate: Date;
        endDate: Date;
      };
      paymentData: {
        orderName: string;
        amount: number;
        payMethod: PayMethod;
      };
    },
  ) {
    // 1. 데이터 베이스에 구독에 대한 row 생성
    const result = await this.subscriptionService.createSubscription(
      payload.subscriptionData,
    );

    // 2. 포트원 결제 생성
    const payment = await this.portOneService.oneTimePayment(
      payload.paymentData,
    );

    console.log(payment);
    // 3. 예약 결제 생성(다음달)

    return result;
  }

  @UseGuards(UserAuthGuard)
  @Get(':userId')
  async getSubscriptionByUserId(
    @Request() req,
    @Param('userId') userId: number,
  ) {
    if (req.user.id !== userId && !req.user.isAdmin) {
      throw new Error('You are not authorized to view this subscription');
    }
    return this.subscriptionService.getSubscriptionByUserId(userId);
  }

  @UseGuards(UserAuthGuard)
  @Put(':id')
  async updateSubscription(
    @Request() req,
    @Param('id') id: number,
    @Body()
    updateData: Partial<typeof subscription.$inferInsert> & { updatedAt: Date },
  ) {
    const request = await this.subscriptionService.getSubscriptionByUserId(
      req.user.id,
    );
    if (request[0].id !== id && !req.user.isAdmin) {
      throw new Error('You are not authorized to update this subscription');
    }
    return this.subscriptionService.updateSubscription(id, {
      ...updateData,
      updatedAt: new Date(),
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(':id')
  async cancelSubscription(@Request() req, @Param('id') id: number) {
    const subscription = await this.subscriptionService.getSubscriptionByUserId(
      req.user.id,
    );
    if (subscription[0].id !== id && !req.user.isAdmin) {
      throw new Error('You are not authorized to cancel this subscription');
    }
    const adminId = req.user.isAdmin ? req.user.id : undefined;
    return this.subscriptionService.cancelSubscription(id, adminId);
  }

  @UseGuards(UserAuthGuard)
  @Post(':id/renew')
  async renewSubscription(
    @Request() req,
    @Param('id') id: number,
    @Body()
    renewData: {
      newEndDate: Date;
      paymentRecord: Partial<typeof paymentHistory.$inferInsert>;
    },
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can renew subscriptions');
    }
    return this.subscriptionService.renewSubscription(
      id,
      renewData.newEndDate,
      {
        ...renewData.paymentRecord,
        subscriptionId: id,
        updatedAt: new Date(),
      },
    );
  }
}
