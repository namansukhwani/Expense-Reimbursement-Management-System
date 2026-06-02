import { ClaimStatus } from '../../../common/enums/claim-status.enum';

export class ClaimResponseDto {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  totalAmount: number;
  approvedAmount?: number;
  employeeNotes?: string;
  submittedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  expenses: import('../../expense/entities/expense.entity').ExpenseEntity[];
  statusHistory: import('../../audit/entities/claim-status-history.entity').ClaimStatusHistoryEntity[];
  approvalActions?: import('../../approval/entities/approval-action.entity').ApprovalActionEntity[];
}
