import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly username: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}

export class OAuthDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly sub: string;

  @IsNotEmpty()
  @IsString()
  readonly avatar: string;
}

export class MeDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;
}

export class ConfirmUserDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly confirmationCode: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  readonly avatar?: string;

  @IsString()
  readonly banner?: string;

  @IsString()
  @MaxLength(100, { message: 'Description max length = 100' })
  readonly description?: string;
}
