import { ApiProperty } from "@nestjs/swagger"

export class BindEmailDto {
  @ApiProperty()
  username: string

  @ApiProperty()
  password: string
}