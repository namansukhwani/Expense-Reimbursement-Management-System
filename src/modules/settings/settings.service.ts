import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettingEntity } from './entities/system-setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemSettingEntity)
    private readonly settingRepo: Repository<SystemSettingEntity>,
  ) {}

  async onModuleInit() {
    const baseCurrency = await this.settingRepo.findOne({ where: { settingKey: 'BASE_CURRENCY' } });
    if (!baseCurrency) {
      const setting = this.settingRepo.create({
        settingKey: 'BASE_CURRENCY',
        settingValue: 'USD',
        description: 'Default base currency for the system',
      });
      await this.settingRepo.save(setting);
    }
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.settingRepo.findOne({ where: { settingKey: key } });
    return setting ? setting.settingValue : null;
  }

  async set(key: string, value: string): Promise<SystemSettingEntity> {
    let setting = await this.settingRepo.findOne({ where: { settingKey: key } });
    if (setting) {
      setting.settingValue = value;
    } else {
      setting = this.settingRepo.create({ settingKey: key, settingValue: value });
    }
    return this.settingRepo.save(setting);
  }

  async getAll(): Promise<SystemSettingEntity[]> {
    return this.settingRepo.find();
  }

  async getBaseCurrency(): Promise<string> {
    const currency = await this.get('BASE_CURRENCY');
    return currency || 'USD';
  }
}
