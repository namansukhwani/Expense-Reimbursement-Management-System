import { IsArray, IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateClaimDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  addExpenseIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  removeExpenseIds?: string[];

  @IsString()
  @IsOptional()
  employeeNotes?: string;
}
