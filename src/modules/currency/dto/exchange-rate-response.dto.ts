export class ExchangeRateResponseDto {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveFrom: Date;
  createdAt: Date;
}
