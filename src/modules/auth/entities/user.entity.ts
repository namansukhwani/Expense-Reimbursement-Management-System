import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', name: 'last_name' })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Column({ type: 'uuid', name: 'department_id', nullable: true })
  departmentId: string;

  @Column({ type: 'uuid', name: 'reporting_manager_id', nullable: true })
  reportingManagerId: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;
}
