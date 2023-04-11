import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { UserService } from './user/user.service';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

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

  @Throttle(3, 60)
  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.userService.create(body)
  }
}
