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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        systemConfig
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
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
