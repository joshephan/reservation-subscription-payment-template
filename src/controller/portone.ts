/**
 * 포트원 결제 컨트롤러
 * 웹훅 정도만 수신해도 될듯
 */

// 빌링키가 존재하는지 확인

// 빌링키를 생성하는 컨트롤러

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard';
import { PortOneService } from '../service/portone';
import { UserService } from '../service/user';
import { IdentityVerificationVerifiedCustomer } from 'src/types';

@Controller('portone')
export class PortOneController {
  constructor(
    private readonly portOneService: PortOneService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('billing-key')
  async createBillingKey(
    @Request() req,
    @Body() verifiedCustomer: IdentityVerificationVerifiedCustomer,
  ) {
    const user = await this.userService.getUserById(req.user.id);

    if (user.billingKey) {
      return { message: 'Billing key already exists' };
    }

    const response =
      await this.portOneService.createBillingKey(verifiedCustomer);

    if (response.ok) {
      const billingKeyData = await response.json();
      await this.userService.updateUser(user.id, {
        billingKey: billingKeyData.billingKey,
      });
      return {
        message: 'Billing key created successfully',
        billingKey: billingKeyData.billingKey,
      };
    } else {
      const errorData = await response.json();
      throw new Error(`Failed to create billing key: ${errorData.message}`);
    }
  }

  // 예약 결제의 결과를 수신하는 웹훅
  @Post('subscription')
  async handleSubscriptionWebhook(@Body() webhookData: any) {
    // Process the webhook data
    console.log('Received webhook:', webhookData);

    // Implement your webhook handling logic here
    // This could include updating payment status, triggering notifications, etc.

    return { message: 'Webhook received and processed' };
  }
}
