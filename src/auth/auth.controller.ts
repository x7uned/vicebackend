import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfirmUserDto, LoginUserDto, MeDto, OAuthDto, RegisterUserDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('oauth')
  async oauth(@Body() oAuthDto: OAuthDto) {
    return this.authService.oAuth(oAuthDto);
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('me')
  async me(@Body() meDto: MeDto) {
    return this.authService.me(meDto);
  }

  @Post('confirm')
  async confirm(@Body() confirmUserDto: ConfirmUserDto) {
    return this.authService.confirmRegistration(confirmUserDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
