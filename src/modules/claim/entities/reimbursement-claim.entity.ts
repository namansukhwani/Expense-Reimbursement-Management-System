import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { DepartmentEntity } from '../../department/entities/department.entity';
import { ExpenseEntity } from '../../expense/entities/expense.entity';
import { ClaimStatusHistoryEntity } from '../../audit/entities/claim-status-history.entity';
import { ApprovalActionEntity } from '../../approval/entities/approval-action.entity';
import { ClaimStatus } from '../../../common/enums/claim-status.enum';

@Entity('reimbursement_claim')
export class ReimbursementClaimEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true, name: 'claim_number' })
  claimNumber: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'uuid', name: 'department_id', nullable: true })
  departmentId: string;

  @Column({ type: 'varchar', enum: ClaimStatus, default: ClaimStatus.DRAFT })
  status: ClaimStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'total_amount',
    default: 0,
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'approved_amount',
    nullable: true,
  })
  approvedAmount: number;

  @Column({ type: 'text', name: 'employee_notes', nullable: true })
  employeeNotes: string;

  @Column({ type: 'timestamp', name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  employee: UserEntity;

  @ManyToOne(() => DepartmentEntity)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @OneToMany(() => ExpenseEntity, (expense) => expense.claim)
  expenses: ExpenseEntity[];

  @OneToMany(() => ClaimStatusHistoryEntity, (history) => history.claim)
  statusHistory: ClaimStatusHistoryEntity[];

  @OneToMany(() => ApprovalActionEntity, (action) => action.claim)
  approvalActions: ApprovalActionEntity[];
}
