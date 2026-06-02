import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto & { entityType?: string; entityId?: string; actorId?: string }) {
    const result = await this.auditService.findAuditLogs(query);
    return { success: true, ...result };
  }

  @Get('claims/:id/history')
  async findClaimHistory(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.auditService.findClaimHistory(id);
    return { success: true, data };
  }
}
