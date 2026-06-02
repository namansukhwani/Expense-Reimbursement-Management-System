import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoryService } from '../category/category.service';
import { CurrencyService } from '../currency/currency.service';
import { SettingsService } from '../settings/settings.service';
import { LocalStorageService } from './local-storage.service';
import { PolicyValidatorService } from './policy-validator.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepo: Repository<ExpenseEntity>,
    private readonly categoryService: CategoryService,
    private readonly currencyService: CurrencyService,
    private readonly settingsService: SettingsService,
    private readonly localStorageService: LocalStorageService,
    private readonly policyValidator: PolicyValidatorService,
  ) {}

  async create(userId: string, dto: CreateExpenseDto): Promise<ExpenseEntity> {
    await this.categoryService.findOne(dto.categoryId);

    const baseCurrency = await this.settingsService.getBaseCurrency();
    const convertedMoney = await this.currencyService.convert(
      dto.amount,
      dto.currency,
      baseCurrency,
    );

    const { hasViolation, reason } = await this.policyValidator.validate(
      dto.categoryId,
      convertedMoney.amount,
      baseCurrency,
    );

    const expense = this.expenseRepo.create({
      ...dto,
      userId,
      convertedAmount: convertedMoney.amount,
      baseCurrency,
      hasPolicyViolation: hasViolation,
      policyViolationReason: reason || '',
      isReimbursable: dto.isReimbursable ?? true,
    });

    return this.expenseRepo.save(expense);
  }

  async findAllByUser(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ExpenseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.expenseRepo.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { expenseDate: 'DESC' },
      relations: { category: true },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, userId: string): Promise<ExpenseEntity> {
    const expense = await this.expenseRepo.findOne({
      where: { id, userId },
      relations: { category: true },
    });
    if (!expense) {
      throw new NotFoundException(`Expense #${id} not found`);
    }
    return expense;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseEntity> {
    const expense = await this.findById(id, userId);

    if (expense.claimId) {
      throw new BadRequestException(
        'Cannot edit an expense that is attached to a claim.',
      );
    }

    if (dto.amount || dto.currency || dto.categoryId) {
      const amount = dto.amount || expense.amount;
      const currency = dto.currency || expense.currency;
      const categoryId = dto.categoryId || expense.categoryId;

      if (dto.categoryId && dto.categoryId !== expense.categoryId) {
        await this.categoryService.findOne(dto.categoryId);
      }

      const baseCurrency = expense.baseCurrency;
      const convertedMoney = await this.currencyService.convert(
        amount,
        currency,
        baseCurrency,
      );

      const { hasViolation, reason } = await this.policyValidator.validate(
        categoryId,
        convertedMoney.amount,
        baseCurrency,
      );

      expense.amount = amount;
      expense.currency = currency;
      expense.categoryId = categoryId;
      expense.convertedAmount = convertedMoney.amount;
      expense.hasPolicyViolation = hasViolation;
      expense.policyViolationReason = reason || '';
    }

    if (dto.title) expense.title = dto.title;
    if (dto.expenseDate) expense.expenseDate = new Date(dto.expenseDate);
    if (dto.notes !== undefined) expense.notes = dto.notes;
    if (dto.isReimbursable !== undefined)
      expense.isReimbursable = dto.isReimbursable;

    return this.expenseRepo.save(expense);
  }

  async setClaimId(
    id: string,
    userId: string,
    claimId: string | null,
  ): Promise<ExpenseEntity> {
    await this.expenseRepo.update({ id, userId }, { claimId });
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const expense = await this.findById(id, userId);

    if (expense.claimId) {
      throw new BadRequestException(
        'Cannot delete an expense that is attached to a claim.',
      );
    }

    if (expense.receiptFilePath) {
      await this.localStorageService.delete(expense.receiptFilePath);
    }

    await this.expenseRepo.remove(expense);
  }

  async uploadReceipt(
    id: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<ExpenseEntity> {
    const expense = await this.findById(id, userId);

    if (expense.claimId) {
      throw new BadRequestException(
        'Cannot modify receipt of an expense attached to a claim.',
      );
    }

    const subPath = await this.localStorageService.upload(file, userId);

    if (expense.receiptFilePath) {
      await this.localStorageService.delete(expense.receiptFilePath);
    }

    expense.receiptFilePath = subPath;
    return this.expenseRepo.save(expense);
  }

  async downloadReceipt(id: string, userId: string): Promise<Buffer> {
    const expense = await this.findById(id, userId);
    if (!expense.receiptFilePath) {
      throw new NotFoundException('Expense does not have a receipt attached');
    }
    return this.localStorageService.download(expense.receiptFilePath);
  }

  async deleteReceipt(id: string, userId: string): Promise<ExpenseEntity> {
    const expense = await this.findById(id, userId);

    if (expense.claimId) {
      throw new BadRequestException(
        'Cannot modify receipt of an expense attached to a claim.',
      );
    }

    if (expense.receiptFilePath) {
      await this.localStorageService.delete(expense.receiptFilePath);
      expense.receiptFilePath = '';
      return this.expenseRepo.save(expense);
    }

    return expense;
  }

  async findUnattachedReimbursable(userId: string): Promise<ExpenseEntity[]> {
    return this.expenseRepo.find({
      where: { userId, isReimbursable: true, claimId: IsNull() },
      order: { expenseDate: 'ASC' },
    });
  }
}
