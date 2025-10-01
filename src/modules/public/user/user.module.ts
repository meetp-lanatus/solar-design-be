import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CacheModule } from '@modules/cache/cache.module'
import { TenantModule } from '@modules/public/tenant/tenant.module'

import { JwtStrategy } from '../auth/passport/jwt/jwt.strategy'

import { Role } from './entities/role.entity'
import { User } from './entities/user.entity'
import { UserTenantRelation } from './entities/user-tenant-relation.entity'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserTenantRelation]),
    TenantModule,
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
    CacheModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
