import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger } from "@nestjs/common";
import { ApiKeyPool } from "./apiKeyPool.entity";
import { EntityRepository } from "@mikro-orm/core";
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from "@nestjs/config";
import axios from 'axios'
import moment from 'moment';
import { error } from "console";

@Injectable()
export class ApiKeyPoolService {

  private readonly logger = new Logger(ApiKeyPoolService.name);

  constructor(
    @InjectRepository(ApiKeyPool)
    private apiKeyPoolRepository: EntityRepository<ApiKeyPool>,
    private configService: ConfigService,
  ){ }

  
  async getRandomAvailableApiKeyByVersion(modelName: string) {
    const apiKeys = await this.apiKeyPoolRepository.find({ available: true, latestSupportVersion:  modelName});
    const randomApiKey = this.getWeightedRandomItem(apiKeys)
    console.log(randomApiKey)
    return randomApiKey
  }

  getWeightedRandomItem(arr) {
    const weights = arr.map((item) => item.weight);
    const totalWeight = weights.reduce((prev, curr) => prev + curr);
    const randomNum = Math.random() * totalWeight;
    let weightSum = 0;
    for (let i = 0; i < arr.length; i++) {
      weightSum += weights[i];
      if (randomNum < weightSum) {
        return arr[i];
      }
    }
  }


  async httpGet(url: string, apikey: string, orgId: string, params: {}) {
    return axios.get(url,{
      headers: {
        'Authorization': 'Bearer ' + apikey,
        'openai-organization': orgId
      },params
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const list = await this.apiKeyPoolRepository.find({})
    const getUsageUrl = this.configService.get('system.openAiBasePath') + '/dashboard/billing/usage'
    const getSubscriptionUrl = this.configService.get('system.openAiBasePath') + '/dashboard/billing/subscription'
    const today = moment();
    const firstDay = today.startOf('month').format('yyyy-MM-DD');
    const lastDay = today.endOf('month').format('yyyy-MM-DD');
    list.forEach((item: ApiKeyPool)=>{
      this.httpGet(getUsageUrl,item.apiKey, item.orgId,{start_date: firstDay, end_date: lastDay}).then((res)=>{
        const usage = res.data.total_usage / 100
        console.log(item.apiKey,item.hardLimitUsd,usage)
        if(usage >= item.hardLimitUsd) {
          this.logger.log("The API key has reached its limit and the status has been changed to unavailable.", item.apiKey)
          item.available = false 
        } else {
          this.logger.log("The API key limit has been refreshed, and the status has been changed to available.", item.apiKey)
          item.available = true 
        }
        item.updateTime = new Date()
        this.apiKeyPoolRepository.nativeUpdate({id: item.id},{...item})

        // this.httpGet(getSubscriptionUrl,item.apiKey, item.orgId,{start_date: firstDay, end_date: lastDay}).then((x)=>{
        //   const hard_limit_usd = x.data.hard_limit_usd
        //   console.log(item.apiKey,hard_limit_usd,usage)
        //   if(+usage >= +hard_limit_usd) {
        //     item.available = false 
        //   } else {
        //     item.available = true 
        //   }
        //   this.apiKeyPoolRepository.nativeUpdate({id: item.id},{...item})
        // })
      }).catch((errro)=>{
        console.log(error)
      });
    })
  }

}