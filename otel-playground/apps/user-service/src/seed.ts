import { UserEntity } from '@app/entities/user.entity';
import { MikroORM } from '@mikro-orm/core';
import type { LoggerService } from '@nestjs/common';

const SEED_USERS = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' },
] as const;

export async function seed(orm: MikroORM, logger: LoggerService): Promise<void> {
  const em = orm.em.fork();
  const count = await em.count(UserEntity);

  if (count > 0) {
    logger.log(`Seed skipped: ${count} users already exist`, 'Seed');
    return;
  }

  for (const data of SEED_USERS) {
    em.create(UserEntity, data);
  }

  await em.flush();
  logger.log(`Seeded ${SEED_USERS.length} users`, 'Seed');
}
