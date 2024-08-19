import { Module } from '@nestjs/common';
import { UserModule } from './module/user';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
