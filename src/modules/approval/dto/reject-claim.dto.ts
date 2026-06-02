import { IsString, MinLength } from 'class-validator';

export class RejectClaimDto {
  @IsString()
  @MinLength(10)
  comment: string;
}
