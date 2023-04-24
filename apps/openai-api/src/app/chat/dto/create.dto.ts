import { ApiProperty } from "@nestjs/swagger";

export class CreateChatDto {

  @ApiProperty()
  characterId: number;
}