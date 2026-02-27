import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const USER_SERVICE = 'http://localhost:3001';
const ORDER_SERVICE = 'http://localhost:3002';

@Injectable()
export class AppService {
  constructor(private readonly http: HttpService) {}

  async getUsers() {
    const { data } = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users`),
    );
    return data;
  }

  async getUser(id: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users/${id}`),
    );
    return data;
  }

  async getOrders() {
    const { data } = await firstValueFrom(
      this.http.get(`${ORDER_SERVICE}/orders`),
    );
    return data;
  }

  async getOrder(id: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${ORDER_SERVICE}/orders/${id}`),
    );
    return data;
  }
}
