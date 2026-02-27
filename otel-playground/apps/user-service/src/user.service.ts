import { Injectable, NotFoundException } from "@nestjs/common";

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

const USERS: readonly User[] = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
  { id: "3", name: "Charlie", email: "charlie@example.com" },
];

@Injectable()
export class UserService {
  findAll(): readonly User[] {
    return USERS;
  }

  findOne(id: string): User {
    const user = USERS.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
