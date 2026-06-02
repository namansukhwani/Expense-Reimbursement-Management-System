import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('department')
export class DepartmentEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'allocated_budget' })
  allocatedBudget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'consumed_budget', default: 0 })
  consumedBudget: number;

  @Column({ type: 'varchar', length: 3, name: 'budget_currency' })
  budgetCurrency: string;
}
