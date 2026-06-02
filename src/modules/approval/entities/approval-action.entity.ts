import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { ReimbursementClaimEntity } from '../../claim/entities/reimbursement-claim.entity';
import { ClaimStatus } from '../../../common/enums/claim-status.enum';

@Entity('approval_action')
export class ApprovalActionEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'claim_id' })
  @Index()
  claimId: string;

  @Column({ type: 'uuid', name: 'manager_id' })
  @Index()
  managerId: string;

  @Column({ type: 'varchar', enum: ClaimStatus })
  action: ClaimStatus;

  @Column({ type: 'int', name: 'approval_level', default: 1 })
  approvalLevel: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => ReimbursementClaimEntity)
  @JoinColumn({ name: 'claim_id' })
  claim: ReimbursementClaimEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'manager_id' })
  manager: UserEntity;
}
