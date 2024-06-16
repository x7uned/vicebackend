import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

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
  
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class ConfirmUserDto {
  @IsString()
  @IsNotEmpty()
  
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly confirmationCode: string;
}
