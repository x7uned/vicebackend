import { Controller, Request, Post, Body, Query, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmUserDto, LoginUserDto, OAuthDto, RegisterUserDto } from './auth.dto';

export interface QueryFindUser {
  id: string
}

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

  @Get('findUser')
  async findUser(@Query() query: QueryFindUser) {
    return this.authService.findUser(query);
  }

  @Get('me')
  async me(@Req() req: Request) {
    const userId = req['user'].id;
    return this.authService.me(userId);
  }

  @Post('confirm')
  async confirm(@Body() confirmUserDto: ConfirmUserDto) {
    return this.authService.confirmRegistration(confirmUserDto)
  }

  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
