import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { TypeConfigService } from '@shared/config/type-config.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly http: HttpService,
    private readonly config: TypeConfigService,
  ) {}

  async createUser(dto: { name: string; email: string }) {
    const userServiceUrl = this.config.get('USER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.post(`${userServiceUrl}/users`, dto));
    return data;
  }

  async getUsers() {
    const userServiceUrl = this.config.get('USER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.get(`${userServiceUrl}/users`));
    return data;
  }

  async getUser(id: string) {
    const userServiceUrl = this.config.get('USER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.get(`${userServiceUrl}/users/${id}`));
    return data;
  }

  async createOrder(dto: { userId: number; product: string; amount: number }) {
    const orderServiceUrl = this.config.get('ORDER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.post(`${orderServiceUrl}/orders`, dto));
    return data;
  }

  async getOrders() {
    const orderServiceUrl = this.config.get('ORDER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.get(`${orderServiceUrl}/orders`));
    return data;
  }

  async getOrder(id: string) {
    const orderServiceUrl = this.config.get('ORDER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.get(`${orderServiceUrl}/orders/${id}`));
    return data;
  }
}
