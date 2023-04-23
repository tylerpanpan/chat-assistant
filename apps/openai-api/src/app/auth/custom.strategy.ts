import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-custom";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy) {

    constructor(private authService: AuthService, private userService: UserService) {
        super()
    }

    async validate(req: Request) {
        //get client ip from request
        let ip = req.headers['x-forwarded-for'] as string || req.ip;
        console.info(ip)
        if (ip.includes(',')) {
           ip = ip.split(',')[0]
        }
        ip = ip.replace("::ffff:", "")
        let user = await this.userService.findOneBy({ ip })

        if (!user) {
            user = await this.userService.createByIP(ip)
        }
        return user;
    }
}
