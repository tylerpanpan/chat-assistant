import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Global, Module } from "@nestjs/common";
import { ApiKeyPool } from "./apiKeyPool.entity";
import { ApiKeyPoolService } from "./apiKeyPool.service";

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([ApiKeyPool])
  ],
  providers: [ApiKeyPoolService],
  exports: [ApiKeyPoolService]
})
export class ApiKeyPoolModule {
}