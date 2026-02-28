import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '@shared/config/type-config.module';
import { LoggingModule } from '@shared/logging/logging.module';
import { resolveLoggingOptions } from '@shared/logging/logging.types';

@Module({
  imports: [HttpModule, TypeConfigModule, LoggingModule.forRoot(resolveLoggingOptions('gateway'))],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
