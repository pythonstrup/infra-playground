import { Entity, Enum, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity()
export class OrderEntity {
  [OptionalProps]?: 'status' | 'createdAt';

  @PrimaryKey()
  id!: number;

  @Property()
  userId!: number;

  @Property()
  product!: string;

  @Property()
  amount!: number;

  @Enum(() => OrderStatus)
  status: OrderStatus = OrderStatus.PENDING;

  @Property()
  createdAt: Date = new Date();
}
