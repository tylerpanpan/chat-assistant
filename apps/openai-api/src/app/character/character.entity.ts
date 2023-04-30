import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { User } from '../user/entities/user.entity';
import { GPTModel } from 'libs/openai-lib/src/enums/GPTModel';
@Entity()
export class Character {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Property({ type: 'varchar', length: 20 })
  name: string;

  @Property({ type: 'text', nullable: true })
  avatar?: string;

  @Property({ type: 'text', nullable: true })
  description: string;

  @Property({ type: 'text' })
  definition: string;

  @Enum({items: () => GPTModel, nullable: true, default: GPTModel.GPT35TURBO0301})
  model: GPTModel;

  @ManyToOne(() => User)
  user: User;

  @Property({ type: 'boolean', nullable: true, default: false })
  isPublic: boolean;

  @Property({ type: 'boolean', nullable: true, default: false })
  isDefault: boolean;

  @Property({ nullable: true })
  welcome: string;

  @Property({ nullable: true, type: 'json' })
  presetQuestions: string[] = []

  @Property({ nullable: true })
  sort: number;

  @Property({ nullable: true, default: false })
  isGuestAccess: boolean;

  @Property({ nullable: true, default: false })
  recommendEnable: boolean;

  @Property({ nullable: true, default: false })
  recommendFocus: boolean;
}
