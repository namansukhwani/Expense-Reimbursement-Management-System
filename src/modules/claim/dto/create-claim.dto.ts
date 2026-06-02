import { IsArray, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateClaimDto {
  @IsArray()
  @IsUUID('4', { each: true })
  expenseIds: string[];

  @IsString()
  @IsOptional()
  employeeNotes?: string;
}
