import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { authenticator } from 'otplib'
import * as crypto from 'crypto'
import { User } from './entities/user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { Role } from '../role/role.decorator';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepo: EntityRepository<User>,
    private configService: ConfigService
  ) { }

  async create({ username, password, referUserId }: CreateUserDto) {
    const exist = await this.userRepo.findOne({ username: username })
    if (exist) {
      throw new HttpException('用户名已存在', 500)
    }

    let referUser = null;
    if (referUserId) {
      referUser = await this.userRepo.findOne({ id: referUserId })
    }

    const result = await this.userRepo.nativeInsert({
      username,
      password: this.createPassword(username, password),
      referUser,
      balance: +this.configService.get('system.userDefaultTokens') || 0,
    }, {});

    if (referUser) {
      referUser.balance = +referUser.balance + (+this.configService.get('system.inviteRewardTokens') || 0);
      await this.userRepo.flush();
    }

    return { id: result }
  }

  async createByIP(ip: string) {
    const user = new User()
    user.ip = ip
    user.type = Role.Guest;
    user.balance = 0;
    await this.userRepo.persistAndFlush(user)
    return user;
  }

  async bindEmail(id: number, username: string, password: string, referUserId?: number) {
    let referUser = null;

    if (referUserId) {
      referUser = await this.userRepo.findOne(referUserId)
    }

    const user = await this.userRepo.findOne(id)
    //  email: body.username,
    //  username: body.username,
    //  type: Role.User,
    //  balance: 5,
    //  password: this.userService.createPassword(body.username, body.password),
    //  ip: null
    user.email = username
    user.username = username
    user.type = Role.User
    user.balance = +this.configService.get('system.userDefaultTokens') || 0
    user.password = this.createPassword(username, password)
    user.ip = null
    user.referUser = referUser
    console.info(this.configService.get('system.userDefaultTokens'),user.balance)
    await this.userRepo.flush()

    if (referUser) {
      referUser.balance = +referUser.balance + (+this.configService.get('system.inviteRewardTokens') || 0);
      console.info(this.configService.get('system.inviteRewardTokens'),referUser.balance)
      await this.userRepo.flush();
    }
    return user;
  }

  async pages(p: number, ps: number) {
    const [data, total] = await this.userRepo.findAndCount({}, {
      limit: ps,
      offset: (p - 1) * ps
    });
    return {
      data,
      total
    }
  }

  findAll() {
    return this.userRepo.find({})
  }

  findOne(id: number) {
    return this.userRepo.findOne({ id }, { fields: ['email', 'id', 'tokens', 'username', 'balance', 'type', 'enable'] });
  }

  findOneBy(where: FilterQuery<User>) {
    return this.userRepo.findOne(where);
  }

  update(id: number, updateUserDto: any) {
    return this.userRepo.nativeUpdate({ id }, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async changePassword(id: number, newPassword: string, password: string) {
    const user = await this.userRepo.findOne({ id })
    if (this.createPassword(user.username, password) !== user.password) {
      throw new HttpException('密码不正确', 500)
    }
    return this.update(id, { password: this.createPassword(user.username, newPassword) })
  }

  async checkPassword(username: string, password: string, token: string) {
    const user = await this.userRepo.findOne({ username })
    if (!user) {
      throw new HttpException('用户不存在', 500)
    }
    if (this.createPassword(username, password) !== user.password) {
      throw new HttpException('用户名或密码不正确', 500)
    }
    if (user.secret) {
      const isValid = authenticator.check(token, user.secret);
      if (!isValid) {
        throw new HttpException({ msg: '二次验证失败', code: 1001 }, 500)
      }
    }
    // if (!user.enable) {
    //   throw new HttpException('用户已被管理员禁用', 500)
    // }
    return user;
  }

  createGoogleSecret() {
    const secret = authenticator.generateSecret();
    return secret;
  }

  verifyGoogleAuth(token: string, secret: string) {
    return authenticator.check(token, secret)
  }

  sha224(text: string) {
    return crypto.createHash('sha224').update(text).digest('hex')
  }

  md5(text: string) {
    return crypto.createHash('md5').update(text).digest('hex');
  };

  createPassword(username: string, password: string) {
    return this.md5(password + '' + username)
  }
}
