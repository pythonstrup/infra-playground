import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const USER_SERVICE = 'http://localhost:3001';

interface Order {
  readonly id: string;
  readonly userId: string;
  readonly product: string;
  readonly amount: number;
}

const ORDERS: readonly Order[] = [
  { id: '1', userId: '1', product: 'Laptop', amount: 1200 },
  { id: '2', userId: '2', product: 'Phone', amount: 800 },
  { id: '3', userId: '1', product: 'Headphones', amount: 150 },
];

@Injectable()
export class OrderService {
  constructor(private readonly http: HttpService) {}

  async findAll() {
    const enriched = await Promise.all(
      ORDERS.map(async (order) => {
        const user = await this.fetchUser(order.userId);
        return { ...order, user };
      }),
    );
    return enriched;
  }

  async findOne(id: string) {
    const order = ORDERS.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const user = await this.fetchUser(order.userId);
    return { ...order, user };
  }

  private async fetchUser(userId: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${USER_SERVICE}/users/${userId}`),
    );
    return data;
  }
}
