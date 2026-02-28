import { Global, Module } from '@nestjs/common';
import { TypeConfigService } from '@shared/config/type-config.service';

@Global()
@Module({
  providers: [TypeConfigService],
  exports: [TypeConfigService],
})
export class TypeConfigModule {}
