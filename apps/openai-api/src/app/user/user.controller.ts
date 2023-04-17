import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpException, Query, Put, SetMetadata, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { Role, Roles } from '../role/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/my')
  my(@Request() { user }) {
    return this.userService.findOne(user.id);
  }

  @Get()
  @Roles(Role.Admin)
  async pages(
    @Query('p') p: number = 1,
    @Query('ps') ps: number = 10
  ) {
    const { data, total } = await this.userService.pages(p, ps);
    return {
      data,
      total,
      page_count: Math.ceil(total / ps)
    }
  }

  @Get('all')
  async findAll() {
    return this.userService.findAll()
  }

  @Patch('change-password')
  @Put('change-password')
  async changePassword(@Request() req, @Body() dto: any) {
    const user = await this.userService.findOne(+req.user.userId)
    return this.userService.changePassword(user.id, dto.newPassword, dto.password)
  }

  @Patch(':id/reset-password')
  async restPassword(@Param('id') id: string, @Body() dto: any) {
    const user = await this.userService.findOne(+id)
    this.userService.update(+id, { password: this.userService.createPassword(user.username, dto.password) })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('google/bind')
  getBindSecret(@Body() dto: GoogleAuthDto) {
    const secret = this.userService.createGoogleSecret()
    return {
      secret
    }
  }

  @Post('google/bind')
  bindGoogleAuth(@Request() req: any, @Body() dto: GoogleAuthDto) {
    const isValid = this.userService.verifyGoogleAuth(dto.token, dto.secret)
    if (isValid) {
      this.userService.update(req.user.userId, { secret: dto.secret })
    } else {
      throw new HttpException('验证失败', 500)
    }
  }

  @Post('google/reset')
  resetGoogleAuth(@Request() req: any, @Body() dto: GoogleAuthDto) {
    const isValid = this.userService.verifyGoogleAuth(dto.token, dto.secret)
    if (isValid) {
      this.userService.update(req.user.userId, { secret: dto.secret })
    } else {
      throw new HttpException('验证失败', 500)
    }
  }

  @Get('google/reset')
  async getResetSecret(@Request() req: any, @Body() dto: GoogleAuthDto) {
    const user = await this.userService.findOne(req.user.userId);
    const isValid = this.userService.verifyGoogleAuth(dto.token, user.secret)
    if (isValid) {
      const secret = this.userService.createGoogleSecret()
      return {
        secret
      }
    } else {
      throw new HttpException('验证失败', 500)
    }
  }
}
