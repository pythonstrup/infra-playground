import { Module } from '@nestjs/common';
import { TypeConfigModule } from '../../../libs/shared/src/config/type-config.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeConfigModule],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
