import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeConfigModule } from '../../../libs/shared/src/config/type-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [HttpModule, TypeConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
