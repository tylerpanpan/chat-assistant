import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import jwtConfig from '../config/jwt.config';
import systemConfig from '../config/system.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CharacterModule } from './character/character.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { ThrottlerModule } from '@nestjs/throttler'
import alipayConfig from '../config/alipay.config';
import { OrderModule } from './order/order.module';
import { UploadModule } from './upload/upload.module';
import ossConfig from '../config/oss.config';
import { RecommendModule } from './recommend/recommend.module';
import { SysConfigModule } from './config/sysConfig.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        systemConfig,
        alipayConfig,
        ossConfig
      ]
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          entities: [],
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          user: configService.get('database.user'),
          password: configService.get('database.password'),
          dbName: configService.get('database.db'),
          charset: 'utf8mb4',
          autoLoadEntities: true,
          debug: false,
        }
      },
    }),
    AuthModule,
    UserModule,
    CharacterModule,
    ChatModule,
    OrderModule,
    UploadModule,
    RecommendModule,
    SysConfigModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
