import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ReimbursementClaimEntity } from '../../claim/entities/reimbursement-claim.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { CategoryEntity } from '../../category/entities/category.entity';

@Entity('expense')
export class ExpenseEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @Column({ type: 'uuid', name: 'claim_id', nullable: true })
  claimId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'converted_amount',
    nullable: true,
  })
  convertedAmount: number;

  @Column({ type: 'varchar', length: 3, name: 'base_currency', nullable: true })
  baseCurrency: string;

  @Column({ type: 'date', name: 'expense_date' })
  expenseDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', name: 'is_reimbursable', default: true })
  isReimbursable: boolean;

  @Column({ type: 'boolean', name: 'has_policy_violation', default: false })
  hasPolicyViolation: boolean;

  @Column({ type: 'text', name: 'policy_violation_reason', nullable: true })
  policyViolationReason: string;

  @Column({ type: 'varchar', name: 'receipt_file_path', nullable: true })
  receiptFilePath: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => ReimbursementClaimEntity, { nullable: true })
  @JoinColumn({ name: 'claim_id' })
  claim: ReimbursementClaimEntity;
}
