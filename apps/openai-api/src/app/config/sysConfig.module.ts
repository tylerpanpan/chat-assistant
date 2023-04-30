import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Global, Module } from "@nestjs/common";
import { SysConfig } from "./entities/sysConfig.entity";
import { SysConfigService } from "./sysConfig.service";

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([SysConfig])
  ],
  providers: [SysConfigService],
  exports: [SysConfigService]
})

export class SysConfigModule {

}