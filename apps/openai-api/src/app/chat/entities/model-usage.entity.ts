import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";
import { GPTModel } from "libs/openai-lib/src/enums/GPTModel";

@Entity()
export class ModelUsage {

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Enum({ items: () => GPTModel, default: GPTModel.GPT35TURBO0301 })
  model: GPTModel;

  @Property()
  tokens: number;

  @Property()
  messages: number;

  @Property()
  month: string;

}