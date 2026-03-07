import { OrderEntity, OrderStatus } from '@app/entities/order.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeConfigService } from '@shared/config/type-config.service';
import { type ContextLogger, WinstonLoggerService } from '@shared/logging/winston-logger.service';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  private readonly logger: ContextLogger;

  constructor(
    private readonly em: EntityManager,
    private readonly http: HttpService,
    private readonly config: TypeConfigService,
    loggerService: WinstonLoggerService,
    @InjectQueue('order-notification')
    private readonly notificationQueue: Queue,
  ) {
    this.logger = loggerService.forContext(OrderService.name);
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.em.findAll(OrderEntity);
  }

  async findOne(id: number) {
    const order = await this.em.findOne(OrderEntity, { id });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    this.logger.debug(`Fetching user ${order.userId} for order ${id}`);
    const user = await this.fetchUser(order.userId);
    return { ...order, user };
  }

  async create(dto: { userId: number; product: string; amount: number }): Promise<OrderEntity> {
    const order = this.em.create(OrderEntity, {
      ...dto,
      status: OrderStatus.CONFIRMED,
    });
    await this.em.persistAndFlush(order);
    this.logger.log(
      `Order created: id=${order.id} userId=${dto.userId} product=${dto.product} amount=${dto.amount}`,
    );

    await this.notificationQueue.add('order-confirmed', {
      orderId: order.id,
      userId: order.userId,
      product: order.product,
      amount: order.amount,
    });
    this.logger.debug(`Notification queued for order ${order.id}`);

    return order;
  }

  private async fetchUser(userId: number) {
    const userServiceUrl = this.config.get('USER_SERVICE_URL');
    const { data } = await firstValueFrom(this.http.get(`${userServiceUrl}/users/${userId}`));
    return data;
  }
}
