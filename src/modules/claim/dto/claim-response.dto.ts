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
  expenses: any[];
  statusHistory: any[];
  approvalActions?: any[];
}
