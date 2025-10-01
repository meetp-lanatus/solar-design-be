import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { CACHE_PREFIX_USER } from '@app/constants'

import { CacheService } from '@modules/cache/cache.service'
import { User } from '@modules/public/user/entities/user.entity'
import { UserService } from '@modules/public/user/user.service'

export type JwtPayload = {
  iat?: number
  exp?: number
  sub: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('token.secret'),
    })
  }

  // This function should return a user object,
  // which will then be injected into the request object by Nest.
  async validate({ sub }: JwtPayload) {
    let user: User

    const stringifiedUser = await this.cacheService.findByKey(
      CACHE_PREFIX_USER + sub,
    )

    if (!stringifiedUser) {
      user = await this.userService.findOne(sub)
      if (!user) {
        throw new UnauthorizedException()
      }

      const { password, ...result } = user

      await this.cacheService.create(
        CACHE_PREFIX_USER + sub,
        JSON.stringify(result),
      )
    } else {
      user = await JSON.parse(stringifiedUser.value)
    }

    const { password, ...result } = user

    return result
  }
}
