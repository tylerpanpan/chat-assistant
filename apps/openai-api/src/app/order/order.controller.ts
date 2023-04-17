import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../guards/roles.guard";
import { OrderService } from "./order.service";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(
    @Body() { amount, mobile }: { amount: number, mobile: number },
    @Req() { user }

  ) {
    return this.orderService.createOrder(user, +amount, !!+mobile);
  }

  @Get()
  findAll(
    @Req() { user }
  ) {
    return this.orderService.findOrders(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOrder(id);
  }
}