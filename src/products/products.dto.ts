import { IsString, IsNotEmpty, MinLength, MaxLength, IsNumber, IsBoolean, Min, IsIn } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['console', 'desktop', 'furniture', 'another'], {
        message: 'Category not found',
    })
    
    readonly category: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    
    readonly title: string;
  
    @IsString()
    @MaxLength(100)
    
    readonly subtitle: string;

    @IsString()
    
    readonly image: string;

    @IsString()
    @IsNotEmpty()
    
    readonly brand: string;

    @IsNumber()
    @IsNotEmpty()
    
    readonly price: number;
}

export class NewBrandDto {
    @IsString()
    @IsNotEmpty()

    readonly brand: string;
}