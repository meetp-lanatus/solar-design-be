import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LoggerMiddleware } from '@app/common/middleware'
import configuration from '@app/config/configuration'

import { CacheModule } from '@modules/cache/cache.module'
import { CaslModule } from '@modules/casl/casl.module'
import { AuthModule } from '@modules/public/auth/auth.module'
import { JwtAuthGuard } from '@modules/public/auth/passport/jwt/jwt.guard'
import { TenantModule } from '@modules/public/tenant/tenant.module'
import { UserController } from '@modules/public/user/user.controller'
import { UserModule } from '@modules/public/user/user.module'
import { TenancyMiddleware } from '@modules/tenancy/tenancy.middleware'
import { TenancyModule } from '@modules/tenancy/tenancy.module'
import { LocationModule } from '@modules/tenanted/location/location.module'
import { SiteModule } from '@modules/tenanted/site/site.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('db.username'),
        password: configService.get<string>('db.password'),
        database: configService.get<string>('db.database'),
        ssl: configService.get<boolean>('db.ssl')
          ? {
              rejectUnauthorized: false,
            }
          : false,
        retryAttempts: 3,
        retryDelay: 10 * 1000,
        synchronize: false,
        entities: [__dirname + '/../../modules/**/*.entity.{ts,js}'],
        migrationsRun: false,
        logging: true,
        useUTC: true,
        applicationName: 'solar-design-be',
        subscribers: [],
      }),
    }),
    UserModule,
    AuthModule,
    CaslModule,
    TenantModule,
    TenancyModule,
    CacheModule,
    SiteModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // Enables JWT authentication globally
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenancyMiddleware)
      .forRoutes(UserController)
      .apply(LoggerMiddleware)
      .forRoutes('*')
  }
}
