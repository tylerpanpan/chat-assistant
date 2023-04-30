import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class SysConfig {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Property({ type: 'varchar', length: 255 })
  configKey: string

  @Property({ type: 'varchar', length: 255 })
  configValue: string

}