import { IsString, IsNumber, IsPositive, Length, IsDateString } from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  @Length(3, 3)
  sourceCurrency: string;

  @IsString()
  @Length(3, 3)
  targetCurrency: string;

  @IsNumber()
  @IsPositive()
  rate: number;

  @IsDateString()
  effectiveFrom: string;
}
