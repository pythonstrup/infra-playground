import { UserEntity } from '@app/entities/user.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { type ContextLogger, WinstonLoggerService } from '@shared/logging/winston-logger.service';
import Redis from 'ioredis';

@Injectable()
export class UserService {
  private readonly logger: ContextLogger;

  constructor(
    private readonly em: EntityManager,
    @InjectRedis() private readonly redis: Redis,
    loggerService: WinstonLoggerService,
  ) {
    this.logger = loggerService.forContext(UserService.name);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.em.findAll(UserEntity);
  }

  async findOne(id: number): Promise<UserEntity> {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for user ${id}`);
      return JSON.parse(cached);
    }

    this.logger.debug(`Cache miss for user ${id}, querying DB`);
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
    this.logger.log(`User created: id=${user.id} email=${dto.email}`);
    return user;
  }
}
