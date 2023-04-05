import { HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
// import { SmsService } from "src/sms/sms.service";
// import { Student } from "src/student/entities/student.entity";
// import { StudentService } from "src/student/student.service";
// import { encData } from "src/utils";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, password: string, token: string) {
    const user = await this.userService.checkPassword(username, password, token)
    return user;
  }

  async login(user: User) {
    const payload = {
      user_type: user.type,
      sub: user.id
    }
    return {
      access_token: this.jwtService.sign(payload),
      type: user.type,
      user: {
        id: user.id,
        username: user.username,
        type: user.type
      },
    }
  }

}
