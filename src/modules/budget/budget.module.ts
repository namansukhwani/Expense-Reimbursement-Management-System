import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetService } from './budget.service';
import { DepartmentEntity } from '../department/entities/department.entity';
import { CurrencyModule } from '../currency/currency.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepartmentEntity]),
    CurrencyModule,
    SettingsModule,
  ],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
