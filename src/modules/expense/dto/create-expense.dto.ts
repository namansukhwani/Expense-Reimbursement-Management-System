import { IsString, IsNumber, IsPositive, IsUUID, IsDateString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  title: string;

  @IsUUID()
  categoryId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsDateString()
  expenseDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isReimbursable?: boolean;
}
