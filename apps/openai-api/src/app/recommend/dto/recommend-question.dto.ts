import { ApiProperty } from "@nestjs/swagger";

export class RecommendQuestionDto {

  @ApiProperty()
  characterId: number;

  @ApiProperty({
    required: false
  })
  text: string;
}