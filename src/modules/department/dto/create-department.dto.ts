import { IsString, IsNumber, IsPositive, Length } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  allocatedBudget: number;

  @IsString()
  @Length(3, 3)
  budgetCurrency: string;
}
