import { Injectable } from '@nestjs/common';
import { CategoryService } from '../category/category.service';

@Injectable()
export class PolicyValidatorService {
  constructor(private readonly categoryService: CategoryService) {}

  async validate(
    categoryId: string,
    convertedAmount: number,
    baseCurrency: string,
  ): Promise<{ hasViolation: boolean; reason: string | null }> {
    const { limit, currency: limitCurrency } =
      await this.categoryService.getCategoryLimit(categoryId);

    // If no limit is set for the category, it passes
    if (limit === null || limitCurrency === null) {
      return { hasViolation: false, reason: null };
    }

    // Since amounts are converted to baseCurrency (USD), we assume limit is also in baseCurrency or we compare directly.
    // In a real system we'd convert the limit if it's in a different currency.
    // For MVP, assuming the limit amount is comparable.

    if (convertedAmount > limit) {
      return {
        hasViolation: true,
        reason: `Expense amount exceeds category limit of ${limit} ${limitCurrency}`,
      };
    }

    return { hasViolation: false, reason: null };
  }
}
