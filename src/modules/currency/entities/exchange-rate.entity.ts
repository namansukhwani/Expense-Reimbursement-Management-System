import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('exchange_rate')
@Index(['sourceCurrency', 'targetCurrency'], { unique: true })
export class ExchangeRateEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 3, name: 'source_currency' })
  sourceCurrency: string;

  @Column({ type: 'varchar', length: 3, name: 'target_currency' })
  targetCurrency: string;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  rate: number;

  @Column({ type: 'timestamp', name: 'effective_from' })
  effectiveFrom: Date;
}
