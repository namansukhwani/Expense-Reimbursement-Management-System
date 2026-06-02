import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('category')
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'reimbursement_limit',
    nullable: true,
  })
  reimbursementLimit: number;

  @Column({
    type: 'varchar',
    length: 3,
    name: 'limit_currency',
    nullable: true,
  })
  limitCurrency: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;
}
