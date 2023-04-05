import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-custom";
import { AuthService } from "./auth.service";

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy) {

    constructor(private authService: AuthService) {
        super()
    }

    async validate(req: Request) {
        const { username, password, token, code, mobile, national_code } = req.body

        // const loginType = await this.authService.getLoginType(username, mobile)
        // let u;
        // if (loginType === 'student') {
        //     // u = await this.authService.validateStudent(username, password, mobile, national_code, code)
        // } else {
        //     u = await this.authService.validateUser(username, password, token)
        // }
        // return u;
        return false;
    }
}
