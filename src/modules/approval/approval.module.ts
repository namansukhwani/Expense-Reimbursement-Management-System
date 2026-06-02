import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { ApprovalActionEntity } from './entities/approval-action.entity';
import { ReimbursementClaimEntity } from '../claim/entities/reimbursement-claim.entity';
import { BudgetModule } from '../budget/budget.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovalActionEntity, ReimbursementClaimEntity]),
    BudgetModule,
    AuditModule,
  ],
  controllers: [ApprovalController],
  providers: [ApprovalService],
})
export class ApprovalModule {}
