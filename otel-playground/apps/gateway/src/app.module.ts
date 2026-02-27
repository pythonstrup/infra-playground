import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '@shared/config/type-config.module';

@Module({
  imports: [HttpModule, TypeConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
