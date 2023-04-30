import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RecommendService } from "./recommend.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RecommendQuestionDto } from "./dto/recommend-question.dto";

@ApiTags('recommend')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('recommend')
export class RecommendController {
  constructor(private recommendService: RecommendService) {
  }


  @Post('question')
  recommendQuestion(
    @Body() { characterId, text }: RecommendQuestionDto,
    @Req() { user }
  ) {
    return this.recommendService.recommendQuestion(characterId, user, text)
  }
}