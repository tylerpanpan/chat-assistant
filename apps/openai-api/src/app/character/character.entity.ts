import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { User } from '../user/entities/user.entity';
@Entity()
export class Character {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Property({ type: 'varchar', length: 20 })
  name: string;

  @Property({ type: 'text', nullable: true })
  avatar?: string;

  @Property({ type: 'text' })
  definition: string;

  @ManyToOne(() => User)
  user: User;

  @Property({ type: 'boolean', nullable: true, default: false })
  isPublic: boolean;

  @Property({ type: 'boolean', nullable: true, default: false })
  isDefault: boolean;
}
