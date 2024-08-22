import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReservationService } from '../service/reservation';
import { reservation } from 'src/schema/reservation';
import { PortOneService } from 'src/service/portone';
import { PayMethod } from '@portone/browser-sdk/dist/v2/entity';
import { PaymentHistoryService } from 'src/service/paymentHistory';
import { UserAuthGuard } from 'src/auth/user.guard';
import { Public } from 'src/auth/public.decorator';

@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly paymentHistoryService: PaymentHistoryService,
    private readonly portoneService: PortOneService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Post()
  async createReservation(
    @Request() req,
    @Body()
    payload: {
      reservationData: typeof reservation.$inferInsert;
      paymentData: {
        orderName: string;
        amount: number;
        payMethod: PayMethod;
      };
    },
  ) {
    payload.reservationData.userId = req.user.id;

    const paymentResult = await this.portoneService.oneTimePayment(
      payload.paymentData,
    );

    // DB 인서트가 생기는 부분
    try {
      const newReservation = await this.reservationService.createReservation(
        paymentResult.txId,
        paymentResult.paymentId,
        payload.paymentData.payMethod,
        payload.reservationData,
      );
      return newReservation;
    } catch (error: any) {
      console.error(error);

      // 만약 결제 취소에서 또 에러가 생겼다면?
      // 포트원 관리자 대시보드에서 수동으로 취소해주어야 함
      // push alarm 형태로 보내줘야 함
      const cancelResult = await this.portoneService.cancelPayment(
        paymentResult.txId,
        payload.paymentData.amount,
        undefined,
        undefined,
        '시스템 에러',
      );

      console.log('cancelResult:', cancelResult);
      throw new Error('Failed to create reservation');
    }
  }

  @UseGuards(UserAuthGuard)
  @Get(':id')
  async getReservationById(@Request() req, @Param('id') id: number) {
    const reservation = await this.reservationService.getReservationById(id);
    if (reservation.userId !== req.user.id && !req.user.isAdmin) {
      throw new Error('You are not authorized to view this reservation');
    }
    return reservation;
  }

  @UseGuards(UserAuthGuard)
  @Put(':id')
  async updateReservation(
    @Request() req,
    @Param('id') id: number,
    @Body() updateData: Partial<typeof reservation.$inferInsert>,
  ) {
    const existingReservation =
      await this.reservationService.getReservationById(id);
    if (existingReservation.userId !== req.user.id && !req.user.isAdmin) {
      throw new Error('You are not authorized to update this reservation');
    }
    return this.reservationService.updateReservation(id, updateData);
  }

  @UseGuards(UserAuthGuard)
  @Delete(':id')
  async cancelReservation(@Request() req, @Param('id') id: number) {
    const existingReservation =
      await this.reservationService.getReservationById(id);
    if (existingReservation.userId !== req.user.id && !req.user.isAdmin) {
      throw new Error('You are not authorized to cancel this reservation');
    }

    const paymentResult =
      await this.paymentHistoryService.getPaymentHistoryByReservationId(id);

    const cancelResult = await this.portoneService.cancelPayment(
      paymentResult.transactionId,
      paymentResult.amount,
      undefined,
      undefined,
      'User canceled reservation',
    );

    if (!cancelResult) {
      throw new Error('Failed to cancel reservation');
    }

    try {
      const cancelReservation =
        await this.reservationService.cancelReservation(id);
      return cancelReservation;
    } catch (error: any) {
      // 결제 취소는 이뤄졌으나 DB상 취소만 안된 상태
      // 이에 대응하는 알림을 관리자에게 보내주어야 함
      console.error(error);
      throw new Error('Failed to cancel reservation');
    }
  }

  @UseGuards(UserAuthGuard)
  @Get('user/:userId')
  async getReservationsByUserId(
    @Request() req,
    @Param('userId') userId: number,
  ) {
    if (req.user.id !== userId && !req.user.isAdmin) {
      throw new Error('You are not authorized to view these reservations');
    }
    return this.reservationService.getReservationsByUserId(userId);
  }

  @Public()
  @Get('room/:hotelRoomId')
  async getReservationsByHotelRoomId(
    @Param('hotelRoomId') hotelRoomId: number,
  ) {
    return this.reservationService.getReservationsByHotelRoomId(hotelRoomId);
  }

  @Public()
  @Get('availability/:hotelRoomId')
  async checkRoomAvailability(
    @Param('hotelRoomId') hotelRoomId: number,
    @Body() dates: { checkInDate: Date; checkOutDate: Date },
  ) {
    return this.reservationService.checkRoomAvailability(
      hotelRoomId,
      dates.checkInDate,
      dates.checkOutDate,
    );
  }

  @UseGuards(UserAuthGuard)
  @Put(':id/status')
  async updateReservationStatus(
    @Request() req,
    @Param('id') id: number,
    @Body() statusUpdate: { status: 'CHECKED_IN' | 'CHECKED_OUT' },
  ) {
    if (!req.user.isAdmin) {
      throw new Error('Only administrators can update reservation status');
    }
    return this.reservationService.updateReservationStatus(
      id,
      statusUpdate.status,
    );
  }
}
