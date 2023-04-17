import { ApiProperty } from "@nestjs/swagger";

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
}