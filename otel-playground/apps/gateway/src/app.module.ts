import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeConfigModule } from "@shared/config/type-config.module";
import { AppController } from "@app/app.controller";
import { AppService } from "@app/app.service";

@Module({
  imports: [HttpModule, TypeConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
