import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { EntityRepository } from "@mikro-orm/core";
import { SysConfig } from "./entities/sysConfig.entity";

@Injectable()
export class SysConfigService {

  constructor(
    @InjectRepository(SysConfig)
    private sysConfigRepository: EntityRepository<SysConfig>,
  ){}

  async getConfigByKey(key: string) {
    const sysConfig = await this.sysConfigRepository.findOne({ configKey: key });
    if(sysConfig) {
      return sysConfig.configValue
    }
    return ''
  }
}