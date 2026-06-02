import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApprovalActionEntity } from './entities/approval-action.entity';
import { ReimbursementClaimEntity } from '../claim/entities/reimbursement-claim.entity';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { PartialApproveClaimDto } from './dto/partial-approve-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { ClaimStatus } from '../../common/enums/claim-status.enum';
import { BudgetService } from '../budget/budget.service';
import { AuditService } from '../audit/audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(ApprovalActionEntity)
    private readonly actionRepo: Repository<ApprovalActionEntity>,
    @InjectRepository(ReimbursementClaimEntity)
    private readonly claimRepo: Repository<ReimbursementClaimEntity>,
    private readonly budgetService: BudgetService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  private async validateAndLoadClaim(claimId: string, managerId: string): Promise<ReimbursementClaimEntity> {
    const claim = await this.claimRepo.findOne({
      where: { id: claimId },
      relations: { employee: true },
    });

    if (!claim) {
      throw new NotFoundException(`Claim #${claimId} not found`);
    }

    if (claim.status !== ClaimStatus.SUBMITTED) {
      throw new BadRequestException(`Claim must be in SUBMITTED state. Current state: ${claim.status}`);
    }

    if (claim.employee.reportingManagerId !== managerId) {
      throw new ForbiddenException('You are not authorized to approve this claim');
    }

    return claim;
  }

  async approve(claimId: string, managerId: string, dto: ApproveClaimDto): Promise<ReimbursementClaimEntity> {
    const claim = await this.validateAndLoadClaim(claimId, managerId);
    
    // We will use a transaction to save the action, update claim, and update budget
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Update Claim
      claim.status = ClaimStatus.APPROVED;
      claim.approvedAmount = claim.totalAmount;
      claim.resolvedAt = new Date();
      await queryRunner.manager.save(claim);

      // 2. Insert Action
      const action = this.actionRepo.create({
        claimId,
        managerId,
        action: ClaimStatus.APPROVED,
        comment: dto.comment,
      });
      await queryRunner.manager.save(action);

      // 3. Log Status Change (we can just use AuditService outside of transaction or re-implement)
      await this.auditService.logStatusChange(
        claim.id,
        ClaimStatus.SUBMITTED,
        ClaimStatus.APPROVED,
        managerId,
        dto.comment
      );

      // 4. Log Action
      await this.auditService.logAction(
        'REIMBURSEMENT_CLAIM',
        claim.id,
        'APPROVE',
        managerId,
        undefined,
        { approvedAmount: claim.approvedAmount },
        'system'
      );

      // 5. Consume Budget (using the injected service directly outside transaction because it uses query builder natively)
      // Since consumeBudget throws if insufficient, if it fails, we rollback.
      if (claim.departmentId) {
        await this.budgetService.consumeBudget(claim.departmentId, Number(claim.approvedAmount));
      }

      await queryRunner.commitTransaction();
      return claim;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async partialApprove(claimId: string, managerId: string, dto: PartialApproveClaimDto): Promise<ReimbursementClaimEntity> {
    const claim = await this.validateAndLoadClaim(claimId, managerId);
    
    if (Number(dto.approvedAmount) >= Number(claim.totalAmount)) {
      throw new BadRequestException('Partial approval amount must be less than total amount');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      claim.status = ClaimStatus.PARTIALLY_APPROVED;
      claim.approvedAmount = dto.approvedAmount;
      claim.resolvedAt = new Date();
      await queryRunner.manager.save(claim);

      const action = this.actionRepo.create({
        claimId,
        managerId,
        action: ClaimStatus.PARTIALLY_APPROVED,
        comment: dto.comment,
      });
      await queryRunner.manager.save(action);

      await this.auditService.logStatusChange(
        claim.id,
        ClaimStatus.SUBMITTED,
        ClaimStatus.PARTIALLY_APPROVED,
        managerId,
        dto.comment
      );

      await this.auditService.logAction(
        'REIMBURSEMENT_CLAIM',
        claim.id,
        'PARTIAL_APPROVE',
        managerId,
        undefined,
        { approvedAmount: claim.approvedAmount },
        'system'
      );

      if (claim.departmentId) {
        await this.budgetService.consumeBudget(claim.departmentId, Number(claim.approvedAmount));
      }

      await queryRunner.commitTransaction();
      return claim;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async reject(claimId: string, managerId: string, dto: RejectClaimDto): Promise<ReimbursementClaimEntity> {
    const claim = await this.validateAndLoadClaim(claimId, managerId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      claim.status = ClaimStatus.REJECTED;
      claim.approvedAmount = 0;
      claim.resolvedAt = new Date();
      await queryRunner.manager.save(claim);

      const action = this.actionRepo.create({
        claimId,
        managerId,
        action: ClaimStatus.REJECTED,
        comment: dto.comment,
      });
      await queryRunner.manager.save(action);

      await this.auditService.logStatusChange(
        claim.id,
        ClaimStatus.SUBMITTED,
        ClaimStatus.REJECTED,
        managerId,
        dto.comment
      );

      await this.auditService.logAction(
        'REIMBURSEMENT_CLAIM',
        claim.id,
        'REJECT',
        managerId,
        undefined,
        { approvedAmount: 0 },
        'system'
      );

      // No budget consumption for rejected claim

      await queryRunner.commitTransaction();
      return claim;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findPendingForManager(managerId: string, query: PaginationQueryDto): Promise<PaginatedResult<ReimbursementClaimEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.claimRepo.findAndCount({
      where: {
        status: ClaimStatus.SUBMITTED,
        employee: { reportingManagerId: managerId },
      },
      relations: { employee: true },
      skip,
      take: limit,
      order: { submittedAt: 'ASC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findApprovalHistory(managerId: string, query: PaginationQueryDto): Promise<PaginatedResult<ApprovalActionEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.actionRepo.findAndCount({
      where: { managerId },
      relations: { claim: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
