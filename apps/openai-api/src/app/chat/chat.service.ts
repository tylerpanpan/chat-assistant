import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, HttpException, Injectable, MethodNotAllowedException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Message, OpenAILib } from "@openai/openai-lib";
import { Character } from "../character/character.entity";
import { User } from "../user/entities/user.entity";
import { Chat } from "./entities/chat.entity";

@Injectable()
export class ChatService {

  private openaiLib: OpenAILib;


  constructor(
    @InjectRepository(Chat)
    private chatRepo: EntityRepository<Chat>,
    private em: EntityManager,
    private configService: ConfigService
  ) {
    this.openaiLib = new OpenAILib(configService.get('system.openAiKey'), configService.get('system.openAiBasePath'));
  }

  async getOne(chatId: number, user: User) {
    return this.chatRepo.findOne({ id: chatId, user }, { populate: ['character'] })
  }

  async clearMessage(chatId: number, user: User) {
    const chat = await this.chatRepo.findOne({ id: chatId, user });
    if (!chat) {
      throw new NotFoundException()
    }
    chat.messages = []
    this.chatRepo.flush()
  }

  async getUserLastChat(user: User, characterId: number) {
    const character = await this.em.getRepository(Character).findOne({ id: characterId });

    let chat = await this.chatRepo.findOne({ user, character: characterId }, { populate: ['character'] })
    if (!chat) {
      chat = new Chat()
      chat.user = user
      chat.character = character
      await this.chatRepo.persistAndFlush(chat)
    }
    return chat
  }

  async chat(chatId: number, user: User, text: string) {
    const userRepo = this.em.getRepository(User);
    const u = await userRepo.findOne({ id: user.id })


    if (u.balance <= 0) {
      throw new HttpException('You have no tokens left', 402)
    }

    const chat = await this.chatRepo.findOne(chatId, { populate: ['character'] })

    if (chat.user.id != user.id) {
      throw new BadRequestException()
    }

    const contexts = this.openaiLib.buildContext(chat.messages, chat.character.definition, 2048)
    const messages = this.openaiLib.buildMessages(text, chat.character.definition, contexts.filter(ctx => !ctx.isDeleted))


    const response = await this.openaiLib.chat(messages);
    const assistantContext = response.choices[0].message.content

    const newMessages = [...contexts, { role: 'user', content: text }, { role: 'assistant', content: assistantContext }]
    chat.messages = newMessages as any
    chat.totalTokens += response.usage.total_tokens || 0
    await this.chatRepo.flush()

    const pricePerThousandTokens = +this.configService.get('system.pricePerThousandTokens') || 0.07

    u.tokens += response.usage.total_tokens || 0
    u.balance -= (response.usage.total_tokens || 0) / 1000 * pricePerThousandTokens
    await userRepo.flush()
    return response.choices[0].message.content;
  }
}
