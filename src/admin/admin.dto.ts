import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['console', 'desktop', 'furniture', 'another'], {
    message: 'Category not found',
  })
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200, { message: 'Address must be between 1 and 200 characters' })
  readonly subtitle: string;
}
