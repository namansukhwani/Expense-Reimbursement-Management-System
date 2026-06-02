import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ReimbursementClaimEntity } from './entities/reimbursement-claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClaimStatus } from '../../common/enums/claim-status.enum';
import { ClaimStateMachineService } from './claim-state-machine.service';
import { ExpenseService } from '../expense/expense.service';
import { AuditService } from '../audit/audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ClaimService {
  constructor(
    @InjectRepository(ReimbursementClaimEntity)
    private readonly claimRepo: Repository<ReimbursementClaimEntity>,
    private readonly stateMachine: ClaimStateMachineService,
    @Inject(forwardRef(() => ExpenseService))
    private readonly expenseService: ExpenseService,
    private readonly auditService: AuditService,
  ) {}

  private async generateClaimNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.claimRepo.count();
    const seq = String(count + 1).padStart(5, '0');
    return `CLM-${year}-${seq}`;
  }

  async create(userId: string, dto: CreateClaimDto): Promise<ReimbursementClaimEntity> {
    if (dto.expenseIds.length === 0) {
      throw new BadRequestException('A claim must have at least one expense');
    }

    const unattachedExpenses = await this.expenseService.findUnattachedReimbursable(userId);
    const unattachedIds = unattachedExpenses.map(e => e.id);
    
    let totalAmount = 0;
    const expensesToAttach = [];

    for (const expenseId of dto.expenseIds) {
      if (!unattachedIds.includes(expenseId)) {
        throw new BadRequestException(`Expense ${expenseId} is not available to be attached`);
      }
      const exp = unattachedExpenses.find(e => e.id === expenseId)!;
      totalAmount += Number(exp.convertedAmount);
      expensesToAttach.push(exp);
    }

    const claimNumber = await this.generateClaimNumber();
    
    // First save the claim
    let claim = this.claimRepo.create({
      claimNumber,
      userId,
      employeeNotes: dto.employeeNotes,
      status: ClaimStatus.DRAFT,
      totalAmount,
    });
    
    claim = await this.claimRepo.save(claim);

    // Attach expenses
    for (const exp of expensesToAttach) {
      await this.expenseService.update(exp.id, userId, { ...exp, claimId: claim.id } as any);
    }

    return claim;
  }

  async findById(claimId: string, userId?: string): Promise<ReimbursementClaimEntity> {
    const where: any = { id: claimId };
    if (userId) {
      where.userId = userId;
    }
    
    const claim = await this.claimRepo.findOne({
      where,
      relations: {
        employee: true,
        department: true,
        expenses: true,
        statusHistory: { changedBy: true },
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim #${claimId} not found`);
    }

    return claim;
  }

  async update(claimId: string, userId: string, dto: UpdateClaimDto): Promise<ReimbursementClaimEntity> {
    const claim = await this.findById(claimId, userId);
    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT claims can be updated');
    }

    let changed = false;

    if (dto.removeExpenseIds && dto.removeExpenseIds.length > 0) {
      for (const expenseId of dto.removeExpenseIds) {
        const exp = claim.expenses.find(e => e.id === expenseId);
        if (exp) {
          await this.expenseService.update(exp.id, userId, { ...exp, claimId: null } as any);
          changed = true;
        }
      }
    }

    if (dto.addExpenseIds && dto.addExpenseIds.length > 0) {
      const unattachedExpenses = await this.expenseService.findUnattachedReimbursable(userId);
      const unattachedIds = unattachedExpenses.map(e => e.id);
      
      for (const expenseId of dto.addExpenseIds) {
        if (!unattachedIds.includes(expenseId)) {
          throw new BadRequestException(`Expense ${expenseId} is not available to be attached`);
        }
        const exp = unattachedExpenses.find(e => e.id === expenseId)!;
        await this.expenseService.update(exp.id, userId, { ...exp, claimId: claim.id } as any);
        changed = true;
      }
    }

    if (dto.employeeNotes !== undefined) {
      claim.employeeNotes = dto.employeeNotes;
      changed = true;
    }

    if (changed) {
      // Recalculate total amount
      const updatedClaim = await this.findById(claimId, userId);
      let totalAmount = 0;
      for (const exp of updatedClaim.expenses) {
        totalAmount += Number(exp.convertedAmount);
      }
      updatedClaim.totalAmount = totalAmount;
      return this.claimRepo.save(updatedClaim);
    }

    return claim;
  }

  async submit(claimId: string, userId: string): Promise<ReimbursementClaimEntity> {
    const claim = await this.findById(claimId, userId);
    
    this.stateMachine.validateTransition(claim.status, ClaimStatus.SUBMITTED);
    
    if (claim.expenses.length === 0) {
      throw new BadRequestException('Cannot submit a claim with 0 expenses');
    }

    const previousStatus = claim.status;
    claim.status = ClaimStatus.SUBMITTED;
    claim.submittedAt = new Date();

    const saved = await this.claimRepo.save(claim);

    await this.auditService.logStatusChange(
      claim.id,
      previousStatus,
      ClaimStatus.SUBMITTED,
      userId,
      'Claim submitted by employee'
    );

    return saved;
  }

  async withdraw(claimId: string, userId: string): Promise<ReimbursementClaimEntity> {
    const claim = await this.findById(claimId, userId);
    
    this.stateMachine.validateTransition(claim.status, ClaimStatus.WITHDRAWN);

    const previousStatus = claim.status;
    claim.status = ClaimStatus.WITHDRAWN;

    // Detach expenses
    for (const exp of claim.expenses) {
       await this.expenseService.update(exp.id, userId, { ...exp, claimId: null } as any);
    }

    const saved = await this.claimRepo.save(claim);

    await this.auditService.logStatusChange(
      claim.id,
      previousStatus,
      ClaimStatus.WITHDRAWN,
      userId,
      'Claim withdrawn by employee'
    );

    return saved;
  }

  async findAllByUser(userId: string, query: PaginationQueryDto & { status?: ClaimStatus }): Promise<PaginatedResult<ReimbursementClaimEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await this.claimRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
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
}
