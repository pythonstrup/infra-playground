import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class UserEntity {
  [OptionalProps]?: 'createdAt';

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  createdAt: Date = new Date();
}
