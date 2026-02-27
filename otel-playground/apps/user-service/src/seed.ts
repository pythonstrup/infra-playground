import { UserEntity } from '@app/entities/user.entity';
import { MikroORM } from '@mikro-orm/core';

const SEED_USERS = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' },
] as const;

export async function seed(orm: MikroORM): Promise<void> {
  const em = orm.em.fork();
  const count = await em.count(UserEntity);

  if (count > 0) {
    console.log(`Seed skipped: ${count} users already exist`);
    return;
  }

  for (const data of SEED_USERS) {
    em.create(UserEntity, data);
  }

  await em.flush();
  console.log(`Seeded ${SEED_USERS.length} users`);
}
