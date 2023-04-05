import { MikroORM } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CharacterController } from "./character.controller";
import { Character } from "./character.entity";
import { CharacterService } from "./character.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Character])
  ],
  controllers: [CharacterController],
  providers: [CharacterService],
  exports: [CharacterService]
})
export class CharacterModule {

}
