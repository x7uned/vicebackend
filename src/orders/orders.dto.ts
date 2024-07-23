import { IsString, Length, IsPhoneNumber, IsEmail, IsIn, IsOptional, IsNotEmpty, IsArray, ArrayNotEmpty, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {

  @IsString({ message: 'Product ID must be a string' })
  readonly id: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  readonly quantity: number;
}

export class CreateOrderDto {

  @IsString({ message: 'First name must be a string' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  readonly firstname: string;

  @IsString({ message: 'Second name must be a string' })
  @Length(1, 50, { message: 'Second name must be between 1 and 50 characters' })
  readonly secondname: string;

  @IsString({ message: 'Surname must be a string' })
  @Length(1, 50, { message: 'Surname must be between 1 and 50 characters' })
  readonly surname: string;

  @IsString({ message: 'Phone number must be a string' })
  @Length(10, 15, { message: 'Phone number must be between 10 and 15 digits' })
  readonly number: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @IsString({ message: 'Post name must be a string' })
  @IsIn(['meest', 'uapost', 'novapost', 'self'], { message: 'Invalid post name' })
  readonly postname: string;

  @IsString({ message: 'Address must be a string' })
  @Length(1, 200, { message: 'Address must be between 1 and 200 characters' })
  readonly address: string;

  @IsString({ message: 'Payment method must be a string' })
  @IsIn(['creditcard', 'paypal', 'onreceipt', 'monopay', 'applepay'], { message: 'Invalid payment method' })
  readonly paymentmethod: string;

  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  @Length(0, 500, { message: 'Comment must be at most 500 characters' })
  readonly comment?: string;

  @IsArray({ message: 'Cart must be an array' })
  @ArrayNotEmpty({ message: 'Cart must not be empty' })
  @ValidateNested({ each: true, message: 'Each item in the cart must be a valid object' })
  @Type(() => CartItemDto)
  readonly cart: CartItemDto[];
}

export class ChangeStatusDto {
  @IsString({ message: 'ID must be a string' })
  @IsNotEmpty({ message: 'ID cannot be empty' })

  readonly id: string;

  @IsString({ message: 'New status must be a string' })
  @IsIn(['new', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'], { message: 'Invalid new status' })
  @IsNotEmpty({ message: 'New status cannot be empty' })

  readonly newstatus: string;
}

export class GetOrderDto {
  @IsString({ message: 'ID must be a string' })
  @IsNotEmpty({ message: 'ID cannot be empty' })

  readonly id: string;
}