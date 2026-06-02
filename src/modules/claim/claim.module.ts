import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimService } from './claim.service';
import { ClaimController } from './claim.controller';
import { ReimbursementClaimEntity } from './entities/reimbursement-claim.entity';
import { ClaimStateMachineService } from './claim-state-machine.service';
import { ExpenseModule } from '../expense/expense.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReimbursementClaimEntity]),
    forwardRef(() => ExpenseModule),
    AuditModule,
  ],
  controllers: [ClaimController],
  providers: [ClaimService, ClaimStateMachineService],
  exports: [ClaimService],
})
export class ClaimModule {}
