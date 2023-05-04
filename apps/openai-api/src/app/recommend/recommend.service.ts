import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { UserCharacterKeywords } from "./entities/user-character-keywords.entity";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ConfigService } from "@nestjs/config";
import { OpenAILib } from "@openai/openai-lib";
import { recommendInitQuestion, recommendQuestionByKeyWord, recommendQuestionByQuestion, summarize } from "../../utils/prompts";
import { ChatService } from "../chat/chat.service";
import { User } from "../user/entities/user.entity";
import { OpenAI } from "langchain/llms/openai";
import { GPTModel } from "libs/openai-lib/src/enums/GPTModel";
import { Character } from "../character/character.entity";
import { ApiKeyPoolService } from "../apiKeyPool/apiKeyPool.service";

@Injectable()
export class RecommendService {
  openAiLib: OpenAILib
  constructor(
    @InjectRepository(UserCharacterKeywords)
    private userCharacterKeywordsRepo: EntityRepository<UserCharacterKeywords>,
    private em: EntityManager,
    private configService: ConfigService,
    private apiKeyPoolService: ApiKeyPoolService,
  ) {
    this.openAiLib = new OpenAILib(configService.get('system.openAiKey'))
    
  }


  async recommendQuestion(characterId: number, user: User, text: string) {
    let keywords = await this.userCharacterKeywordsRepo.find({
      user,
      character: characterId
    }, { orderBy: { id: 'desc',hitCount: 'DESC' }, limit: 5 })
    const character = await this.em.findOne(Character, characterId)
    if(!character){
      throw new Error('角色不存在')
    }
    const modelName = GPTModel.GPT35TURBO0301
    const apiKeyPool = await this.apiKeyPoolService.getRandomAvailableApiKeyByVersion(modelName)
    const model = new OpenAI({
      openAIApiKey: apiKeyPool.apiKey,
      modelName: modelName,
    }, {
      basePath: this.configService.get('system.openAiBasePath'),
      organization: apiKeyPool.orgId
    })

    if (text) {
      const summarizeResponse = await model.call(summarize(text))
      const keyword = summarizeResponse.replace(/。|\./g, '')
      if(!keywords.find(k => k.keyword === keyword)) {
        const saveKeyword = this.userCharacterKeywordsRepo.create({
          user,
          character: characterId,
          keyword: keyword,
          hitCount: 1
        })
        await this.em.persistAndFlush(saveKeyword)
        keywords.push(saveKeyword)
        const res = character.recommendFocus ? await model.call(recommendQuestionByQuestion(text)) : await model.call(recommendQuestionByKeyWord([saveKeyword].map(keyword => keyword.keyword)))
        return res;
      }
    } else {
      if(keywords.length < 0) {
        const res = await model.call(recommendInitQuestion())
        return res
      }else{
        const res = await model.call(recommendQuestionByKeyWord(keywords.map(keyword => keyword.keyword)))
        keywords.forEach(keyword => {
          keyword.hitCount += 1
        })
        await this.em.flush()
        return res
      }
    }
  }
}