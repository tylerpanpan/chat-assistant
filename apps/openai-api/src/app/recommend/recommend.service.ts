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

@Injectable()
export class RecommendService {
  openAiLib: OpenAILib
  model: OpenAI
  constructor(
    @InjectRepository(UserCharacterKeywords)
    private userCharacterKeywordsRepo: EntityRepository<UserCharacterKeywords>,
    private em: EntityManager,
    private configService: ConfigService,
  ) {
    this.openAiLib = new OpenAILib(configService.get('system.openAiKey'))
    this.model = new OpenAI({
      openAIApiKey: this.configService.get('system.openAiKey'),
      modelName: GPTModel.GPT35TURBO0301,
    }, {
      basePath: this.configService.get('system.openAiBasePath'),
      organization: this.configService.get('system.openAiOrgId')
    })
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
   

    if (text) {
      const summarizeResponse = await this.model.call(summarize(text))
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
        const res = character.recommendFocus ? await this.model.call(recommendQuestionByQuestion(text)) : await this.model.call(recommendQuestionByKeyWord([saveKeyword].map(keyword => keyword.keyword)))
        return res;
      }
    } else {
      if(keywords.length < 0) {
        const res = await this.model.call(recommendInitQuestion())
        return res
      }else{
        const res = await this.model.call(recommendQuestionByKeyWord(keywords.map(keyword => keyword.keyword)))
        keywords.forEach(keyword => {
          keyword.hitCount += 1
        })
        await this.em.flush()
        return res
      }
    }
  }
}