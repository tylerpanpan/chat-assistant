import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { Order } from "./order.entity";
import { OrderService } from "./order.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Order])
  ],
  controllers: [
    OrderController
  ],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {

}