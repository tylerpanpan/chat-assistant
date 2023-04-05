import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { CustomStrategy } from "./custom.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";

@Module({
    imports: [
        UserModule,
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get('jwt.secret')
                return {
                    secret
                }
            },
            inject: [ConfigService]
        })],
    providers: [AuthService, LocalStrategy, JwtStrategy, CustomStrategy],
    exports: [AuthService]
})
export class AuthModule {


}
