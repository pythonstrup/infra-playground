import { OrderEntity, OrderStatus } from '@app/entities/order.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeConfigService } from '@shared/config/type-config.service';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(
    private readonly em: EntityManager,
    private readonly http: HttpService,
    private readonly config: TypeConfigService,
    @InjectQueue('order-notification')
    private readonly notificationQueue: Queue,
  ) {}

  async findAll(): Promise<OrderEntity[]> {
    return this.em.findAll(OrderEntity);
  }

  async findOne(id: number) {
    const order = await this.em.findOne(OrderEntity, { id });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const user = await this.fetchUser(order.userId);
    return { ...order, user };
  }

  async create(dto: { userId: number; product: string; amount: number }): Promise<OrderEntity> {
    const order = this.em.create(OrderEntity, {
      ...dto,
      status: OrderStatus.CONFIRMED,
    });
    await this.em.persistAndFlush(order);

    await this.notificationQueue.add('order-confirmed', {
      orderId: order.id,
      userId: order.userId,
      product: order.product,
      amount: order.amount,
    });

    return order;
  }

  private async fetchUser(userId: number) {
    const userServiceUrl = this.config.get('USER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.get(`${userServiceUrl}/users/${userId}`));
    return data;
  }
}
