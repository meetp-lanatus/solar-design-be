import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { NoAuth } from '@app/common/decorator'
import { VERSION_1 } from '@app/constants'

import { UserService } from '@modules/public/user/user.service'

import { ChangePasswordDto } from './dto/change-password.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { GoogleUserDto } from './dto/google.dto'
import { LoginDto } from './dto/login.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { SignupDto } from './dto/signup.dto'
import { TokenRefreshDto } from './dto/token-refresh.dto'
import { GoogleOAuthGuard } from './passport/google/google-oauth.guard'
import { AuthService } from './auth.service'
import { IRequest } from './user.interface'

@Controller({
  path: 'auth',
  version: VERSION_1,
})
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @NoAuth()
  @ApiResponse({ status: 201, description: 'Successful Login' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() dto: LoginDto): Promise<any> {
    const user = await this.authService.validateUser(dto)
    return await this.authService.createTokenPair(user)
  }

  @Post('signup')
  @NoAuth()
  @ApiResponse({ status: 201, description: 'Successful Registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    const user = await this.userService.signUpUser(signupDto)
    return await this.authService.createTokenPair(user)
  }

  @Post('refresh')
  @NoAuth()
  @ApiResponse({ status: 201, description: 'Successful Token Refresh' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(@Body() dto: TokenRefreshDto): Promise<any> {
    const user = await this.authService.validateRefreshToken(dto)
    return await this.authService.createTokenPair(user)
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Password changed successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Request() request: IRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<any> {
    const user = await this.authService.updatePassword(
      request.user?.userId,
      dto,
    )
    return await this.authService.createTokenPair(user)
  }

  @Post('forgot-password')
  @NoAuth()
  @ApiResponse({ status: 201, description: 'Reset password email send.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<any> {
    return await this.authService.forgotPassword(dto)
  }

  @Post('reset-password')
  @NoAuth()
  @ApiResponse({ status: 201, description: 'Reset password.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<any> {
    const user = await this.authService.resetPassword(dto)
    return await this.authService.createTokenPair(user)
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Successful Logout' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() request: IRequest): Promise<any> {
    return await this.userService.deleteRefreshToken(request.user?.userId)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoggedInUser(@Request() request: IRequest): Promise<any> {
    return await this.userService.findOne(request.user?.userId)
  }

  @Get('google/login')
  @NoAuth()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google/redirect')
  @NoAuth()
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req, @Response() res) {
    const googleUser = req.user
    if (!googleUser) {
      throw new UnauthorizedException('User not found.')
    }

    const googleUserDto: GoogleUserDto = {
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
    }

    const user = await this.authService.validateGoogleUser(googleUserDto)

    let redirectURL = this.configService.get<string>('google.redirectURL')

    if (user) {
      const { accessToken, expiresIn, refreshToken } =
        await this.authService.createTokenPair(user)
      redirectURL =
        redirectURL +
        `?token=${accessToken}&expiresIn=${expiresIn}&refreshToken=${refreshToken}`
    } else {
      redirectURL = redirectURL + `?error=USER_NOT_REGISTERED`
    }

    res.redirect(redirectURL)
  }
}
