import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Auditable } from '../../common/decorators/auditable.decorator';

@UseGuards(JwtAuthGuard)
@Auditable('SYSTEM_SETTING')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAll() {
    const data = await this.settingsService.getAll();
    return { success: true, data };
  }

  @Patch(':key')
  async update(@Param('key') key: string, @Body('value') value: string) {
    const data = await this.settingsService.set(key, value);
    return { success: true, data };
  }
}
