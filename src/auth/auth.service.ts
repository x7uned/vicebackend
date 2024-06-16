import { Injectable, Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer'; // Импорт сервиса для отправки почты
import { ConfirmUserDto, LoginUserDto, RegisterUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService, // Внедрение сервиса для отправки почты
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.redisClient.hgetall(`user:${username}`);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user && bcrypt.compareSync(pass, user.password)) {
      return { username: user.username };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.username, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const { username, password, email } = registerUserDto;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const confirmationCode = Math.random().toString(36).substring(2, 15);

    await this.redisClient.hmset(`user:${username}`, {
      username,
      email,
      password: hashedPassword,
      confirmationCode,
    });

    await this.sendConfirmationEmail(email, confirmationCode);

    return { message: 'User registered successfully' };
  }

  // Метод для отправки письма с кодом подтверждения
  private async sendConfirmationEmail(email: string, confirmationCode: string): Promise<void> {
    const subject = 'Confirm Registration';

    const text = `Your confirmation code is: ${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      from: 'denis.goptsii@gmail.com',
      subject,
      text,
    });
  }

  async confirmRegistration(confirmUserDto: ConfirmUserDto): Promise<void> {
    const { username, confirmationCode } = confirmUserDto;
    const user = await this.redisClient.hgetall(`user:${username}`);

    if (user && user.confirmationCode === confirmationCode) {
      await this.redisClient.hdel(`user:${username}`, 'confirmationCode');
    } else {
      throw new UnauthorizedException('Invalid confirmation code');
    }
  }
}
