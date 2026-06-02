import { IsString, IsNumber, IsOptional, IsPositive, Length, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  reimbursementLimit?: number;

  @IsString()
  @Length(3, 3)
  @IsOptional()
  limitCurrency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
