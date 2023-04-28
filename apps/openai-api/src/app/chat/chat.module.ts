import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CharacterModule } from "../character/character.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { Chat } from "./entities/chat.entity";
import { ModelUsage } from "./entities/model-usage.entity";

@Module({
  imports: [
    MikroOrmModule.forFeature([Chat, ModelUsage]),
    CharacterModule
  ],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {

}
