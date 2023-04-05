import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { authenticator } from 'otplib'
import * as crypto from 'crypto'
import { User } from './entities/user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepo: EntityRepository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {
    const exist = await this.userRepo.findOne({ username: createUserDto.username })
    if (exist) {
      throw new HttpException('用户名已存在', 500)
    }
    const result = await this.userRepo.nativeInsert({
      username: createUserDto.username,
      password: this.createPassword(createUserDto.username, createUserDto.password)
    }, {});
    return { id: result }
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
    return this.userRepo.findOne({ id });
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
