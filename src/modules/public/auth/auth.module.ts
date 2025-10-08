import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { CacheModule } from '@modules/cache/cache.module'
import { UserModule } from '@modules/public/user/user.module'

import { GoogleStrategy } from './passport/google/google.strategy'
import { JwtStrategy } from './passport/jwt/jwt.strategy'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('token.secret'),
          signOptions: {
            expiresIn: configService.get<string>('token.expiration'),
          },
        }
      },
    }),
    UserModule,
    ConfigModule,
    CacheModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [PassportModule.register({ defaultStrategy: 'jwt' })],
})
export class AuthModule {}
