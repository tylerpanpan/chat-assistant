import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Global, Module } from "@nestjs/common";
import { ApiKeyPool } from "./apiKeyPool.entity";
import { ApiKeyPoolService } from "./apiKeyPool.service";
import { ApiKeyPoolController } from "./apiKeyPool.controller";

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([ApiKeyPool])
  ],
  controllers: [ApiKeyPoolController],
  providers: [ApiKeyPoolService],
  exports: [ApiKeyPoolService]
})
export class ApiKeyPoolModule {
}