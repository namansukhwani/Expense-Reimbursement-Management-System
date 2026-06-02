import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { ClaimStatus } from '../../../common/enums/claim-status.enum';

@Entity('claim_status_history')
export class ClaimStatusHistoryEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'claim_id' })
  @Index()
  claimId: string;

  // Relation will be added in Phase 7
  // @ManyToOne(() => ReimbursementClaimEntity)
  // @JoinColumn({ name: 'claim_id' })
  // claim: ReimbursementClaimEntity;

  @Column({ type: 'varchar', enum: ClaimStatus, name: 'from_status' })
  fromStatus: ClaimStatus;

  @Column({ type: 'varchar', enum: ClaimStatus, name: 'to_status' })
  toStatus: ClaimStatus;

  @Column({ type: 'uuid', name: 'changed_by_id' })
  changedById: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: UserEntity;

  @Column({ type: 'text', nullable: true })
  reason: string;
}
