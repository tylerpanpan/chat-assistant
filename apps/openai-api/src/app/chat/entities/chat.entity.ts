import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Message } from "@openai/openai-lib";
import { Character } from "../../character/character.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Chat {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Character)
  character: Character

  @Property({ type: 'json' })
  messages: Message[] = []

  @Property({type: 'int', nullable: true})
  totalTokens: number;

  @Property({ type: 'datetime', onCreate: () => new Date(), nullable: true })
  createdAt: Date;

  @Property({ type: 'datetime', onUpdate: () => new Date(), nullable: true })
  updatedAt: Date;
}
