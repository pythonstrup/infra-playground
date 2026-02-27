import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeConfigModule } from "@shared/config/type-config.module";
import { OrderController } from "@app/order.controller";
import { OrderService } from "@app/order.service";

@Module({
  imports: [HttpModule, TypeConfigModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
