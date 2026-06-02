import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { ClaimStatusHistoryEntity } from './entities/claim-status-history.entity';
import { ClaimStatus } from '../../common/enums/claim-status.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    @InjectRepository(ClaimStatusHistoryEntity)
    private readonly claimHistoryRepo: Repository<ClaimStatusHistoryEntity>,
  ) {}

  async logAction(
    entityType: string,
    entityId: string,
    action: string,
    actorId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    ipAddress?: string,
  ): Promise<AuditLogEntity> {
    const log = this.auditLogRepo.create({
      entityType,
      entityId,
      action,
      actorId,
      oldValues,
      newValues,
      ipAddress,
    });
    return this.auditLogRepo.save(log);
  }

  async logStatusChange(
    claimId: string,
    fromStatus: ClaimStatus,
    toStatus: ClaimStatus,
    changedById: string,
    reason?: string,
  ): Promise<ClaimStatusHistoryEntity> {
    const history = this.claimHistoryRepo.create({
      claimId,
      fromStatus,
      toStatus,
      changedById,
      reason,
    });
    return this.claimHistoryRepo.save(history);
  }

  async findAuditLogs(
    query: PaginationQueryDto & {
      entityType?: string;
      entityId?: string;
      actorId?: string;
    },
  ): Promise<PaginatedResult<AuditLogEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.actorId) where.actorId = query.actorId;

    const [data, total] = await this.auditLogRepo.findAndCount({
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

  async findClaimHistory(claimId: string): Promise<ClaimStatusHistoryEntity[]> {
    return this.claimHistoryRepo.find({
      where: { claimId },
      order: { createdAt: 'ASC' },
      relations: { changedBy: true },
    });
  }
}
