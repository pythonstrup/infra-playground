import { Global, Module } from '@nestjs/common';
import { TypeConfigService } from './type-config.service';

@Global()
@Module({
  providers: [TypeConfigService],
  exports: [TypeConfigService],
})
export class TypeConfigModule {}
