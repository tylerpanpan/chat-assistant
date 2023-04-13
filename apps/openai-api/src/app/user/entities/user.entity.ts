import { Collection, Entity, ManyToMany, OneToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";


@Entity()
export class User {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Property()
  username: string;

  @Property()
  email: string;

  @Property()
  password: string;

  @Property()
  type: string;

  @Property({})
  secret: string;

  @Property({ default: 1 })
  enable: boolean

  @Property({ type: 'int', default: 0, nullable: true })
  tokens: number
}
