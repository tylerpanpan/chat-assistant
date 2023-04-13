import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "../user/entities/user.entity";

export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
}

@Entity()
export class Order {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @ManyToOne(() => User, { cascade: [Cascade.PERSIST] })
  user: User;

  @Property({ length: 64 })
  orderNo: string;

  @Property()
  amount: number;

  @Property()
  tokens: number;

  @Property({ type: 'enum', default: OrderStatus.Pending })
  status: OrderStatus;

  @Property({ type: 'json', nullable: true })
  payData: any;

  @Property({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Property({ type: 'datetime', onCreate: () => new Date(), nullable: true })
  createdAt: Date;

  @Property({ type: 'datetime', onUpdate: () => new Date(), nullable: true })
  updatedAt: Date;
}