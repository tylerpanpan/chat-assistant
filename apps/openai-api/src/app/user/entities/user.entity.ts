import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Role } from "../../role/role.decorator";


@Entity()
export class User {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Property({ nullable: true })
  username: string;

  @Property({ nullable: true })
  email: string;

  @Property({ nullable: true })
  password: string;

  @Enum({ items: () => Role, default: Role.Guest, nullable: true })
  type: Role;

  @Property({ nullable: true })
  secret: string;

  @Property({ default: 1 })
  enable: boolean

  @Property({ type: 'int', default: 0, nullable: true })
  tokens: number

  @Property({ type: 'decimal', scale: 8, precision: 2, default: 0, nullable: true })
  balance: number

  @Property({ type: 'varchar', length: 15, nullable: true })
  ip: string

  @Property({ default: 0, nullable: true })
  messageCount: number;

  @ManyToOne(() => User, { nullable: true })
  referUser?: User;
}
