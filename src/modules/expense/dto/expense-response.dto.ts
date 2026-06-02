export class ExpenseResponseDto {
  id: string;
  title: string;
  categoryId: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  baseCurrency: string;
  expenseDate: Date;
  notes: string;
  isReimbursable: boolean;
  hasPolicyViolation: boolean;
  policyViolationReason: string;
  receiptFilePath: string;
  createdAt: Date;
}
