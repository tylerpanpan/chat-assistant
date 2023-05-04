import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiKeyPoolService } from "./apiKeyPool.service";

@Controller('apipool')
@ApiTags('apipool')
@ApiBearerAuth()
export class ApiKeyPoolController {

  constructor(private apiPoolService: ApiKeyPoolService) {

  }

  @Get('last')
  async lastChat(
  ) {
    return this.apiPoolService.getRandomAvailableApiKeyByVersion("3.5")
  }
}