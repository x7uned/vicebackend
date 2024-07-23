import { Injectable, Inject, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfirmUserDto, LoginUserDto, OAuthDto, RegisterUserDto, MeDto } from './auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { QueryFindUser } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const keys = await this.redisClient.keys('user:*');
    
    for (const key of keys) {
      const user = await this.redisClient.hgetall(key);
      if (user.email === email) {
         if (bcrypt.compareSync(pass, user.password)) {
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            confirmationCode: user.confirmationCode,
          };
        } else {
          throw new UnauthorizedException('Invalid credentials');
        }
      }
    }

    throw new NotFoundException('User not found');
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
    
    const accessToken = this.jwtService.sign({id: user.id});

    return {
      success: true,
      user: payload,
      access_token: accessToken,
    };
  }

  async findUser(query: QueryFindUser) {
    const {id} = query;

    const existingUsers = await this.redisClient.keys(`user:${id}`);
    
    for (const userKey of existingUsers) {
      const user = await this.redisClient.hgetall(userKey);
      delete(user.password)
      return {success: true, user}
    }
    return {success:false}
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

    await this.redisClient.hmset(`user:${userId}`, {
      id: userId,
      username,
      email,
      password: hashedPassword,
      confirmationCode,
    });

    await this.sendConfirmationEmail(email, confirmationCode);

    return { userId, success: true };
  }

  async me(userId: string) {
    const existingUsers = await this.redisClient.keys('user:*');

    for (const userKey of existingUsers) {
      const user = await this.redisClient.hgetall(userKey);
      if (user.id === userId || user.email === userId) {
        delete user.password;
        return { success: true, user };
      }
    }

    return { success: false };
  }

  async oAuth(oAuthDto: OAuthDto) {
    const { username, email, sub, avatar } = oAuthDto;
    console.log('oauth', email)
    const existingUsers = await this.redisClient.keys('user:*');
    
    for (const userKey of existingUsers) {
      const user = await this.redisClient.hgetall(userKey);
      if (user.email === email) {
        const access_token = this.jwtService.sign({id: user.id})
        return { message: 'User with this email already exists', access_token, success: true }
      }
    }

    const userId = uuidv4();

    await this.redisClient.hmset(`user:${userId}`, {
      id: userId,
      username,
      email,
      sub,
      avatar
    });

    const access_token = this.jwtService.sign({id: userId})

    return { message: 'User registered successfully', access_token, success: true };
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
    const { userId, confirmationCode } = confirmUserDto;
    const user = await this.redisClient.hgetall(`user:${userId}`);
    const payload = { userId };
  
    if (user && user.confirmationCode === confirmationCode) {
      await this.redisClient.hdel(`user:${userId}`, 'confirmationCode');
      return {
        access_token: this.jwtService.sign(payload),
        success: true,
      };
    } else {
      throw new UnauthorizedException('Invalid confirmation code');
    }
  }
}
