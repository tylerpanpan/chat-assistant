import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "../../user/entities/user.entity";
import { Character } from "../../character/character.entity";

@Entity({ tableName: 'user_character_keywords' })
export class UserCharacterKeywords {

  @PrimaryKey()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Character)
  character: Character;

  @Property()
  keyword: string;

  @Property({ default: 0, nullable: true })
  hitCount: number;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date(), onCreate: () => new Date() })
  updatedAt: Date = new Date();
}