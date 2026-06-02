import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../department/entities/department.entity';
import { CurrencyService } from '../currency/currency.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
    private readonly currencyService: CurrencyService,
    private readonly settingsService: SettingsService,
  ) {}

  async consumeBudget(departmentId: string, amount: number, currency?: string): Promise<void> {
    const department = await this.departmentRepo.findOne({ where: { id: departmentId } });
    if (!department) {
      throw new BadRequestException('Department not found');
    }

    let amountToConsume = amount;
    
    // If currency provided and different from budget currency, convert it
    if (currency && currency !== department.budgetCurrency) {
      const converted = await this.currencyService.convert(amount, currency, department.budgetCurrency);
      amountToConsume = converted.amount;
    }

    const newConsumed = Number(department.consumedBudget) + Number(amountToConsume);
    if (newConsumed > Number(department.allocatedBudget)) {
      throw new BadRequestException('INSUFFICIENT_DEPARTMENT_BUDGET');
    }

    // Atomic update
    await this.departmentRepo
      .createQueryBuilder()
      .update(DepartmentEntity)
      .set({ consumedBudget: () => `consumed_budget + ${amountToConsume}` })
      .where("id = :id", { id: departmentId })
      .execute();
  }

  async releaseBudget(departmentId: string, amount: number, currency?: string): Promise<void> {
    const department = await this.departmentRepo.findOne({ where: { id: departmentId } });
    if (!department) {
      throw new BadRequestException('Department not found');
    }

    let amountToRelease = amount;
    
    if (currency && currency !== department.budgetCurrency) {
      const converted = await this.currencyService.convert(amount, currency, department.budgetCurrency);
      amountToRelease = converted.amount;
    }

    // Atomic update
    await this.departmentRepo
      .createQueryBuilder()
      .update(DepartmentEntity)
      .set({ consumedBudget: () => `consumed_budget - ${amountToRelease}` })
      .where("id = :id", { id: departmentId })
      .execute();
  }

  async getBudgetSummary(departmentId: string): Promise<{ allocated: number; consumed: number; remaining: number; currency: string }> {
    const department = await this.departmentRepo.findOne({ where: { id: departmentId } });
    if (!department) {
      throw new BadRequestException('Department not found');
    }

    const allocated = Number(department.allocatedBudget);
    const consumed = Number(department.consumedBudget);
    const remaining = allocated - consumed;

    return {
      allocated,
      consumed,
      remaining,
      currency: department.budgetCurrency,
    };
  }
}
