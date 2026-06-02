import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('system_setting')
export class SystemSettingEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true, name: 'setting_key' })
  settingKey: string;

  @Column({ type: 'text', name: 'setting_value' })
  settingValue: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
