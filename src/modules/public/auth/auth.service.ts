import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { Hash } from '@app/utils/hash.util'

import { User } from '@modules/public/user/entities/user.entity'
import { UserService } from '@modules/public/user/user.service'

import { ChangePasswordDto } from './dto/change-password.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { GoogleUserDto } from './dto/google.dto'
import { LoginDto } from './dto/login.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { TokenRefreshDto } from './dto/token-refresh.dto'
import { JwtPayload } from './passport/jwt/jwt.strategy'
import { IUser } from './user.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async validateUser(dto: LoginDto): Promise<IUser> {
    const user = await this.userService.findByEmail(dto.email)
    if (!user) {
      throw new UnauthorizedException('User not found.')
    }

    const isPasswordValid = Hash.compare(dto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password')
    }

    delete user.password

    return user
  }

  async createTokenPair(user: IUser) {
    const payload: JwtPayload = {
      sub: user.userId,
    }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('token.refresh.secret'),
      expiresIn: this.configService.get<string>('token.refresh.expiration'),
    })
    const expiresIn = this.configService.get<string>('token.expiration')

    await this.userService.updateRefreshToken(user.userId, refreshToken)

    return {
      accessToken,
      refreshToken,
      expiresIn,
    }
  }

  async validateRefreshToken(dto: TokenRefreshDto): Promise<IUser> {
    const { sub, exp } = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
      secret: this.configService.get<string>('token.refresh.secret'),
    })

    const user = await this.userService.findOne(sub)

    const isMatchedRefreshToken = dto.refreshToken === user.refreshToken
    if (!isMatchedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    // exp is in second
    const isExpiredRefreshToken = Date.now() > exp * 1000
    if (isExpiredRefreshToken) {
      throw new UnauthorizedException('Expired refresh token')
    }

    return user
  }

  // check is user exists if not then create it
  async validateGoogleUser(googleUser: GoogleUserDto): Promise<User | null> {
    const user = await this.userService.findByEmail(googleUser.email)
    if (user) {
      return user
    }
    return null
  }

  async updatePassword(
    userId: string,
    changePassword: ChangePasswordDto,
  ): Promise<User> {
    const user = await this.userService.findOne(userId)

    const isPasswordValid = Hash.compare(
      changePassword.currentPassword,
      user.password,
    )
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password')
    }

    return await this.userService.updateUserPassword(
      userId,
      changePassword.newPassword,
    )
  }

  async sendPasswordResetEmail(
    token: string,
    sendTo: { email: string; name: string },
  ): Promise<any> {
    const domainUrl = this.configService.get<string>('email.redirectUrl')
    const brevoApiKey = this.configService.get<string>('brevo.apiKey')

    const resetPasswordUrl = `${domainUrl}?token=${token}&email=${sendTo.email}`

    const emailPayload = {
      sender: {
        name: 'Medicine Wholesaler',
        email: 'medicinewholesaler0@gmail.com',
      },
      to: [sendTo],
      subject: 'Password Reset Request',
      htmlContent: `
        <html>
          <head></head>
          <body>
            <p>Hello,</p>
            <p>We received a request to reset your password. Please click the link below to create a new password:</p>
            <p><a href="${resetPasswordUrl}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>Medicine Wholesaler</p>
          </body>
        </html>
      `,
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })
      const res = await response.json()

      return 'Email sent.'
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send password reset email')
    }
  }

  async forgotPassword(forgotPassword: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPassword.email)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const accessToken = this.jwtService.sign({
      sub: user.userId,
      email: user.email,
    })

    return await this.sendPasswordResetEmail(accessToken, {
      email: forgotPassword.email,
      name: user.firstName,
    })
  }

  async resetPassword(resetPassword: ResetPasswordDto) {
    const user = await this.userService.findByEmail(resetPassword.email)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const decodedToken = await this.jwtService.verify(resetPassword.token)
    const { email } = decodedToken

    console.log('Email from token:', email)

    // if email is same as dto email then update password and delete refresh token
    if (email === resetPassword.email) {
      return await this.userService.updateUserPassword(
        user.userId,
        resetPassword.newPassword,
      )
    }

    throw new Error('Invalid token.')
  }
}
