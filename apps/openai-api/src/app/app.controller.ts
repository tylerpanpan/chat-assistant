import { Body, Controller, Get, HttpException, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { OrderService } from './order/order.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { UserService } from './user/user.service';
import AlipaySdk from 'alipay-sdk';
import { readFileSync } from "fs";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BindEmailDto } from './user/dto/bind-email.dto';
import { Role } from './role/role.decorator';

@Controller()
@ApiTags('app')
export class AppController {
  alipaySdk: AlipaySdk;

  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly configService: ConfigService
  ) {
    this.alipaySdk = new AlipaySdk({
      appId: this.configService.get('alipay.appId'),
      privateKey: readFileSync(this.configService.get('alipay.privateKey'), 'ascii'),
      alipayPublicKey: readFileSync(this.configService.get('alipay.publicKey'), 'ascii'),
      signType: 'RSA2',
      keyType: 'PKCS8',
    });
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('login')
  @Throttle(5, 60)
  @UseGuards(AuthGuard('local'))
  login(@Req() req: any) {
    return this.authService.login(req.user)
  }

  @Post('ip_login')
  @Throttle(5, 60)
  @UseGuards(AuthGuard('custom'))
  ipLogin(@Req() req: any) {
    return this.authService.login(req.user)
  }

  @Throttle(3, 60)
  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.userService.create(body)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('bind')
  @ApiBearerAuth()
  async bind(@Req() { user }, @Body() body: BindEmailDto) {

    if(user.type !== Role.Guest){
      throw new HttpException('already has email', 400);
    }
    const exist = await this.userService.findOneBy({username: body.username})
    if(exist){
      throw new HttpException('email already exist', 400);
    }
    await this.userService.update(user.id, {
      email: body.username,
      username: body.username,
      type: Role.User,
      balance: 5,
      password: this.userService.createPassword(body.username, body.password),
      ip: null
    })

    const ret = await this.userService.findOne(user.id)

    return this.authService.login(ret)
  }

  @Post('alipay_notify')
  async alipayNotify(@Body() body: any, @Query() query: any) {
    console.info(body)
    if (this.alipaySdk.checkNotifySign(body)) {
      if (body.trade_status === 'TRADE_SUCCESS') {
        const { out_trade_no } = body;
        await this.orderService.completeOrder(out_trade_no, body)
        return { 'success': true };
      } else {
        console.info('订单状态不正确')
        throw new HttpException('订单状态不正确', 400);
      }
    } else {
      console.info('签名错误')
      throw new HttpException('签名错误', 400);
    }
  }
}
