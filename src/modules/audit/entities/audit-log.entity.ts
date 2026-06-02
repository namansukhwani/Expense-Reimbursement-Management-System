import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../auth/entities/user.entity';

@Entity('audit_log')
export class AuditLogEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'entity_type' })
  @Index()
  entityType: string;

  @Column({ type: 'uuid', name: 'entity_id' })
  @Index()
  entityId: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'uuid', name: 'actor_id', nullable: true })
  actorId: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: UserEntity;

  @Column({ type: 'jsonb', name: 'old_values', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', name: 'new_values', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress: string;
}
