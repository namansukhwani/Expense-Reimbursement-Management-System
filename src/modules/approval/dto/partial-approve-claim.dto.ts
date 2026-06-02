import { IsString, IsNumber, IsPositive, MinLength } from 'class-validator';

export class PartialApproveClaimDto {
  @IsNumber()
  @IsPositive()
  approvedAmount: number;

  @IsString()
  @MinLength(10)
  comment: string;
}
