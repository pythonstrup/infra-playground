import { AppService } from '@app/app.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('users')
  createUser(@Body() dto: { name: string; email: string }) {
    return this.appService.createUser(dto);
  }

  @Get('users')
  getUsers() {
    return this.appService.getUsers();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.appService.getUser(id);
  }

  @Post('orders')
  createOrder(@Body() dto: { userId: number; product: string; amount: number }) {
    return this.appService.createOrder(dto);
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
