import { Injectable, Inject, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfirmUserDto, LoginUserDto, OAuthDto, RegisterUserDto, MeDto } from './auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.redisClient.hgetall(`user:${email}`);
    if (!user || Object.keys(user).length === 0) {
      throw new NotFoundException('User not found');
    }
    if (user && bcrypt.compareSync(pass, user.password)) {
      return { id: user.id, email: user.email, username: user.username, avatar: user.avatar, confirmationCode: user.confirmationCode };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { 
      email: user.email, 
      username: user.username || '', 
      avatar: user.avatar || '', 
      confirmationCode: user.confirmationCode || '',
      id: user.id,
    };
    return {
      success: true,
      user: payload,
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const { username, password, email } = registerUserDto;
    const existingUsers = await this.redisClient.keys('user:*');
    
    for (const userKey of existingUsers) {
      const user = await this.redisClient.hgetall(userKey);
      if (user.email === email) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const confirmationCode = Math.random().toString(36).substring(2, 15);
    const userId = uuidv4();

    await this.redisClient.hmset(`user:${email}`, {
      id: userId,
      username,
      email,
      password: hashedPassword,
      confirmationCode,
    });

    await this.sendConfirmationEmail(email, confirmationCode);

    return { email, success: true };
  }

  async me(meDto: MeDto) {
    const { id } = meDto;
    const existingUsers = await this.redisClient.keys('user:*');

    for (const userKey of existingUsers) {
      const user = await this.redisClient.hgetall(userKey);
      if (user.id === id || user.email === id) {
        return { success: true }
      }
    }

    return { success: false }
  }

  async oAuth(oAuthDto: OAuthDto) {
    const { username, email, sub, avatar } = oAuthDto;
    const existingUsers = await this.redisClient.keys('user:*');
    
    for (const userKey of existingUsers) {
      const user = await this.redisClient.hgetall(userKey);
      if (user.email === email) {
        const id = user.id;
        return { message: 'User with this email already exists', id, success: true }
      }
    }

    const userId = uuidv4();

    await this.redisClient.hmset(`user:${email}`, {
      id: userId,
      username,
      email,
      sub,
      avatar
    });

    return { message: 'User registered successfully', username, success: true };
  }

  private async sendConfirmationEmail(email: string, confirmationCode: string): Promise<void> {
    const subject = 'Confirm Registration';

    const html = `<p>Your confirmation code is: <b style="color: red">${confirmationCode}</b></p>`;

    await this.mailerService.sendMail({
      to: email,
      from: 'denis.goptsii@gmail.com',
      subject,
      html,
    });
  }

  async confirmRegistration(confirmUserDto: ConfirmUserDto): Promise<{ success: true, access_token: string }> {
    const { email, confirmationCode } = confirmUserDto;
    const user = await this.redisClient.hgetall(`user:${email}`);
    const payload = { email };
  
    if (user && user.confirmationCode === confirmationCode) {
      await this.redisClient.hdel(`user:${email}`, 'confirmationCode');
      return {
        access_token: this.jwtService.sign(payload),
        success: true,
      };
    } else {
      throw new UnauthorizedException('Invalid confirmation code');
    }
  }
}
