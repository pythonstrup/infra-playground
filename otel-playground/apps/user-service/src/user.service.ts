import { UserEntity } from '@app/entities/user.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class UserService {
  constructor(
    private readonly em: EntityManager,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.em.findAll(UserEntity);
  }

  async findOne(id: number): Promise<UserEntity> {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.em.findOne(UserEntity, { id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    await this.redis.set(cacheKey, JSON.stringify(user), 'EX', 60);
    return user;
  }

  async create(dto: { name: string; email: string }): Promise<UserEntity> {
    const user = this.em.create(UserEntity, dto);
    await this.em.persistAndFlush(user);
    return user;
  }
}
