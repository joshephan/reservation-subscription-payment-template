import { PortOneController } from 'src/controller/portone';
import { PortOneService } from 'src/service/portone';
import { Module } from '@nestjs/common';
import { UserService } from 'src/service/user';

@Module({
  imports: [],
  controllers: [PortOneController],
  providers: [PortOneService, UserService],
})
export class PortOneModule {}
