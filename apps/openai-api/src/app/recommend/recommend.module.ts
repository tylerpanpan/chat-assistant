import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { UserCharacterKeywords } from "./entities/user-character-keywords.entity";
import { RecommendController } from "./recommend.controlller";
import { RecommendService } from "./recommend.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([UserCharacterKeywords]), 
  ],
  controllers: [RecommendController],
  providers: [RecommendService]
})
export class RecommendModule {

}