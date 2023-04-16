import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Order, OrderStatus } from "./order.entity";
import AlipaySdk from 'alipay-sdk';
import moment from 'moment';
import { readFileSync } from "fs";
import { User } from "../user/entities/user.entity";

@Injectable()
export class OrderService {
  alipaySdk: AlipaySdk;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: EntityRepository<Order>,
    private readonly em: EntityManager,
    private configService: ConfigService
  ) {
    this.alipaySdk = new AlipaySdk({
      appId: this.configService.get('alipay.appId'),
      privateKey: readFileSync(this.configService.get('alipay.privateKey'), 'ascii'),
      signType: 'RSA2',
      keyType: 'PKCS8',
    });
  }


  async createOrder(user: any, amount: number, isMobile: boolean) {
    const order = new Order();
    order.user = user;
    order.tokens = 0;
    order.amount = amount;
    order.status = OrderStatus.Pending;
    order.orderNo = this.generateOrderNo();
    await this.orderRepo.persistAndFlush(order);
    const alipayParams = {
      out_trade_no: order.orderNo,
      total_amount: order.amount,
      subject: `智能聊天助手充值`,
      product_code: isMobile ? 'QUICK_WAP_WAY' : 'FAST_INSTANT_TRADE_PAY',
    };

    const alipayUrl = this.alipaySdk.pageExec(isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay', {
      bizContent: alipayParams,
      notify_url: this.configService.get('alipay.notifyUrl'),
      return_url: this.configService.get('alipay.returnUrl'),
    })
    return alipayUrl;
  }

  generateOrderNo() {
    const date = moment().format('YYYYMMDD');
    const random = Math.random().toString().slice(2, 10);
    return `${date}${random}`;
  }

  async findOrder(orderNo: string) {
    return this.orderRepo.findOne({ orderNo })
  }

  async findOrders(user: any) {
    return this.orderRepo.find({ user }, { populate: ['user'], orderBy: { createdAt: 'DESC' } })
  }

  async completeOrder(orderNo: string, payData: any) {
    const order = await this.orderRepo.findOne({ orderNo }, { populate: ['user'] });
    if (!order) throw new HttpException('订单不存在', 404);
    if (order.status !== OrderStatus.Pending) throw new HttpException('订单状态不正确', 400);
    //offer the amount to the user
    order.status = OrderStatus.Paid;
    order.payData = payData;
    order.paidAt = new Date();
    await this.orderRepo.persistAndFlush(order);

    const userRepo =  this.em.getRepository(User);
    const user = await userRepo.findOne({id: order.user.id})
    user.balance = +user.balance + order.amount;
  
    await userRepo.flush();
  }

}