import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ExpenseEntity } from './entities/expense.entity';
import { LocalStorageService } from './local-storage.service';
import { PolicyValidatorService } from './policy-validator.service';
import { CategoryModule } from '../category/category.module';
import { CurrencyModule } from '../currency/currency.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseEntity]),
    CategoryModule,
    CurrencyModule,
    SettingsModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, LocalStorageService, PolicyValidatorService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
