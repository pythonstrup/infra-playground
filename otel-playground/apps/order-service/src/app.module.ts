import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeConfigModule } from '../../../libs/shared/src/config/type-config.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [HttpModule, TypeConfigModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
