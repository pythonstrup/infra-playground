import { Module } from "@nestjs/common";
import { TypeConfigModule } from "@shared/config/type-config.module";
import { UserController } from "@app/user.controller";
import { UserService } from "@app/user.service";

@Module({
  imports: [TypeConfigModule],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
