import { OrderEntity, OrderStatus } from "@app/entities/order.entity";
import { EntityManager } from "@mikro-orm/postgresql";
import { HttpService } from "@nestjs/axios";
import { InjectQueue } from "@nestjs/bullmq";
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TypeConfigService } from "@shared/config/type-config.service";
import {
  type ContextLogger,
  WinstonLoggerService,
} from "@shared/logging/winston-logger.service";
import { Queue } from "bullmq";
import { firstValueFrom } from "rxjs";

@Injectable()
export class OrderService {
  private readonly logger: ContextLogger;

  constructor(
    private readonly em: EntityManager,
    private readonly http: HttpService,
    private readonly config: TypeConfigService,
    loggerService: WinstonLoggerService,
    @InjectQueue("order-notification")
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
    const product = await this.fetchProduct(order.productId).catch(() => null);
    return { ...order, user, product };
  }

  async create(dto: {
    userId: number;
    productId: number;
    amount: number;
  }): Promise<OrderEntity> {
    const product = await this.fetchProduct(dto.productId);

    const order = this.em.create(OrderEntity, {
      userId: dto.userId,
      productId: dto.productId,
      product: product.name,
      amount: dto.amount,
      status: OrderStatus.CONFIRMED,
    });
    await this.em.persistAndFlush(order);
    this.logger.log(
      `Order created: id=${order.id} userId=${dto.userId} productId=${dto.productId} product=${order.product} amount=${dto.amount}`,
    );

    await this.notificationQueue.add("order-confirmed", {
      orderId: order.id,
      userId: order.userId,
      product: order.product,
      amount: order.amount,
    });
    this.logger.debug(`Notification queued for order ${order.id}`);

    await this.createShipment(dto.productId, dto.amount);

    return order;
  }

  private async fetchUser(userId: number) {
    const url = this.config.get("USER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${url}/users/${userId}`),
    );
    return data;
  }

  private async fetchProduct(productId: number) {
    const url = this.config.get("CATALOG_SERVICE_URL");
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${url}/api/products/${productId}`),
      );
      return data.data;
    } catch (e: any) {
      if (e.response?.status === 404) {
        throw new NotFoundException(
          `Product ${productId} not found in catalog`,
        );
      }
      throw new BadGatewayException("Catalog service unavailable");
    }
  }

  private async createShipment(productId: number, quantity: number) {
    const url = this.config.get("FULFILLMENT_SERVICE_URL");
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${url}/api/shipments`, { productId, quantity }),
      );
      this.logger.log(
        `Shipment created: id=${data.data?.id} for product=${productId}`,
      );
    } catch (e: any) {
      this.logger.warn(
        `Shipment creation failed for product=${productId}: ${e.message}`,
      );
    }
  }
}
