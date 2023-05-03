import { ApiProperty } from "@nestjs/swagger";
import { GPTModel } from "libs/openai-lib/src/enums/GPTModel";

export class CreateCharacterDto {
  @ApiProperty()
  name: string;

  @ApiProperty({
    required: false
  })
  avatar?: string;

  @ApiProperty()
  definition: string;

  @ApiProperty({
    required: false
  })
  isPublic: boolean;

  @ApiProperty({
    required: false
  })
  welcome: string;

  @ApiProperty({
    required: false
  })
  presetQuestions: string[];

  @ApiProperty({
    required: false
  })
  description?: string;

  @ApiProperty({
    required: false
  })
  model?: GPTModel;

  @ApiProperty({
    required: false
  })
  temperature?: number;

  @ApiProperty({
    required: false
  })
  frequencyPenalty?: number;
}