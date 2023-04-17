import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {

  @ApiProperty({
    example: 100,
    description: 'Amount of money to pay'
  })
  amount: number;

  @ApiProperty({
    example: 1,
    description: '1 for mobile, 0 for web'
  })
  mobile: number;
}