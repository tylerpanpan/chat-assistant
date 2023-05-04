import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class ApiKeyPool {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Property({ type: 'varchar', length: 255 })
  apiKey: string;

  @Property({ type: 'varchar', length: 10})
  latestSupportVersion: string;

  @Property({ type: 'boolean', nullable: true, default: true })
  available: boolean;

  @Property({ type: 'varchar', length: 255 })
  orgId: string;

  @Property({ type: 'varchar', length: 255 })
  desc: string;

  @Property({ type: 'double'})
  hardLimitUsd: number;

  @Property({ type: 'float'})
  weight: number;

  @Property({ type: 'datetime' })
  updateTime: Date


}