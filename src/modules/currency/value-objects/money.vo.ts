export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {}

  toBase(rate: number, baseCurrency: string): Money {
    const convertedAmount = Math.round((this.amount * rate) * 100) / 100;
    return new Money(convertedAmount, baseCurrency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
