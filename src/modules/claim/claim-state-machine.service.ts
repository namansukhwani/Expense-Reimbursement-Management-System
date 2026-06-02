import { Injectable, BadRequestException } from '@nestjs/common';
import { ClaimStatus } from '../../common/enums/claim-status.enum';

@Injectable()
export class ClaimStateMachineService {
  private readonly validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
    [ClaimStatus.DRAFT]: [ClaimStatus.SUBMITTED],
    [ClaimStatus.SUBMITTED]: [
      ClaimStatus.APPROVED, 
      ClaimStatus.PARTIALLY_APPROVED, 
      ClaimStatus.REJECTED, 
      ClaimStatus.WITHDRAWN
    ],
    [ClaimStatus.APPROVED]: [],
    [ClaimStatus.PARTIALLY_APPROVED]: [],
    [ClaimStatus.REJECTED]: [],
    [ClaimStatus.WITHDRAWN]: [],
  };

  canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
    const allowed = this.validTransitions[from] || [];
    return allowed.includes(to);
  }

  validateTransition(from: ClaimStatus, to: ClaimStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(`Cannot transition claim from ${from} to ${to}`);
    }
  }

  getAvailableTransitions(status: ClaimStatus): ClaimStatus[] {
    return this.validTransitions[status] || [];
  }
}
