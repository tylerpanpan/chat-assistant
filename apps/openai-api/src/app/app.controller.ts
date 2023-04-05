import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService
  ) { }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req: any) {
    return this.authService.login(req.user)
  }
}
