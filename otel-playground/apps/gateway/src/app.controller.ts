import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers() {
    return this.appService.getUsers();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.appService.getUser(id);
  }

  @Get('orders')
  getOrders() {
    return this.appService.getOrders();
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.appService.getOrder(id);
  }
}
