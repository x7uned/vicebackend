import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import {
  ConfirmUserDto,
  LoginUserDto,
  OAuthDto,
  RegisterUserDto,
  UpdateProfileDto,
} from './auth.dto';
import { AuthService } from './auth.service';

export interface QueryFindUser {
  id: string;
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

  @Put('updateProfile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req['user'].id;
    return this.authService.updateProfile(userId, updateProfileDto);
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
    return this.authService.confirmRegistration(confirmUserDto);
  }

  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
