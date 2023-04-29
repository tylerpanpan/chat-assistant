import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, HttpException, Injectable, MethodNotAllowedException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Message, OpenAILib } from "@openai/openai-lib";
import { Character } from "../character/character.entity";
import { User } from "../user/entities/user.entity";
import { Chat } from "./entities/chat.entity";
import { Role } from "../role/role.decorator";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from 'langchain/chains'
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "langchain/prompts";
import { CallbackManager } from "langchain/callbacks";
import { GPTModel } from "libs/openai-lib/src/enums/GPTModel";
import { ModelUsage } from "./entities/model-usage.entity";
import moment from "moment";


@Injectable()
export class ChatService {

  private openaiLib: OpenAILib;


  constructor(
    @InjectRepository(Chat)
    private chatRepo: EntityRepository<Chat>,
    @InjectRepository(ModelUsage)
    private modelUsageRepo: EntityRepository<ModelUsage>,
    private em: EntityManager,
    private configService: ConfigService
  ) {
    this.openaiLib = new OpenAILib(configService.get('system.openAiKey'), configService.get('system.openAiBasePath'));
  }

  async getOne(chatId: number, user: User) {
    const chat = await this.chatRepo.findOne({ id: chatId, user }, { populate: ['character'] })
    chat.updatedAt = new Date();
    this.chatRepo.flush();
    return chat;
  }

  async getAll(user: User, characterId: number) {

    const character = await this.em.getRepository(Character).findOne({ id: characterId });

    let chats = await this.chatRepo.find({ user, character }, { populate: ['character'] })

    return chats
  }

  async delete(chatId: number, user: User) {
    const chat = await this.chatRepo.findOne({ id: chatId, user })
    if (!chat) {
      throw new NotFoundException()
    }
    await this.chatRepo.removeAndFlush(chat)
  }

  async create(characterId: number, user: User) {
    const chat = new Chat()
    chat.user = user
    chat.character = this.em.getReference(Character, characterId)
    await this.chatRepo.persistAndFlush(chat)
    return chat;
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

    let chat = await this.chatRepo.findOne({ user, character: characterId }, { populate: ['character'], orderBy: { 'updatedAt': 'desc',id: 'desc' } })
    if (!chat) {
      chat = new Chat()
      chat.user = user
      chat.character = character
      await this.chatRepo.persistAndFlush(chat)
    }
    return chat
  }

  async recordModelUsage(model: GPTModel, tokens: number, messages: number) {
    const month = moment().format('YYYY-MM')
    const usage = await this.modelUsageRepo.findOne({ model, month })
    if (usage) {
      usage.tokens += tokens
      usage.messages += messages
    } else {
      const usage = new ModelUsage()
      usage.model = model
      usage.tokens = tokens
      usage.messages = messages
      usage.month = month
      await this.modelUsageRepo.persistAndFlush(usage)
    }
  }

  async chat(chatId: number, user: User, text: string, stream: boolean = false, handleNewToken?: (msg: string) => void) {
    const userRepo = this.em.getRepository(User);
    const u = await userRepo.findOne({ id: user.id })

    const time = moment().format('YYYY-MM-DD HH:mm')
    if (u.type === Role.Guest && user.messageCount >= (+this.configService.get('system.guestMessageLimit') || 10)) {
      throw new HttpException('You have reached the limit of messages', 403)
    }

    if (u.type !== Role.Guest && u.balance <= 0) {
      throw new HttpException('You have no tokens left', 402)
    }

    const chat = await this.chatRepo.findOne(chatId, { populate: ['character'] })

    if (chat.user.id != user.id) {
      throw new BadRequestException()
    }

    if(chat.character.model === GPTModel.GPT4 && user.gpt4Limit <= 0) {
      throw new HttpException('You have reached the limit of messages', 419)
    }

    const modelUsage  = await this.modelUsageRepo.findOne({ model: chat.character.model, month: moment().format('YYYY-MM') })
    if(modelUsage && chat.character.model === GPTModel.GPT4) {
      if(modelUsage.messages >= (+this.configService.get('system.gpt4MonthlyMessageLimit') || 9000)) {
        throw new HttpException('Model has reached the limit of messages', 500)
      }
    }


    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(chat.character.definition),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ])

    const contexts = this.openaiLib.buildContext(chat.messages, chat.character.definition, 2048)
    const filteredContext = contexts.filter(ctx => !ctx.isDeleted)

    const history = new ChatMessageHistory()
    filteredContext.forEach(msg => {
      if (msg.role === 'assistant') {
        history.addAIChatMessage(msg.content)
      } else if (msg.role === 'user') {
        history.addUserMessage(msg.content)
      }
    })

    const memory = new BufferMemory({
      chatHistory: history,
      returnMessages: true,
      memoryKey: `history`,
    });

    let totalTokens = 0

    const chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get('system.openAiKey'),
      streaming: stream,
      modelName: chat.character.model || GPTModel.GPT35TURBO0301,
      callbackManager: CallbackManager.fromHandlers({
        handleLLMEnd: async (llmresult) => {
          const tokenUsage = llmresult.llmOutput?.tokenUsage
          totalTokens = tokenUsage.totalTokens
        },
        handleLLMNewToken: async (token) => {
          handleNewToken(token)
        },
        handleLLMError: async (error) => {
          console.log(error)
        }
      })
    }, { 
      basePath: this.configService.get('system.openAiBasePath'),
      organization: this.configService.get('system.openAiOrgId')
    })

    const chain = new ConversationChain({
      memory,
      llm: chatModel,
      prompt: chatPrompt,
    })

    const { response } = await chain.call({ input: text });

    totalTokens = totalTokens || this.openaiLib.countMessageToken([...this.openaiLib.buildMessages(text, chat.character.definition, filteredContext), { role: 'assistant', content: response }])

    const newMessages = [...contexts, { role: 'user', content: text, time }, { role: 'assistant', content: response, time: moment().format('YYYY-MM-DD HH:mm') }]
    chat.messages = newMessages as any
    chat.totalTokens += totalTokens || 0
    await this.chatRepo.flush()

    if (u.type !== Role.Guest) {
      const pricePerThousandTokens = +this.configService.get('system.pricePerThousandTokens') || 0.07
      const gpt4PricePerThousandTokens = +this.configService.get('system.gpt4PricePerThousandTokens') || 0.756
      u.tokens += totalTokens || 0
      if(chat.character.model === GPTModel.GPT4) {
        u.gpt4Limit -= 1
        u.balance -= (totalTokens || 0) / 1000 * gpt4PricePerThousandTokens
      }else{
        u.balance -= (totalTokens || 0) / 1000 * pricePerThousandTokens
      }
    }
    u.messageCount += 1

    //record the model usage
    await this.recordModelUsage(chat.character.model, totalTokens || 0, 1)

    await userRepo.flush()
    return response;
  }
}
