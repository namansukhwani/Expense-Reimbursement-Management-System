import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLogEntity } from './entities/audit-log.entity';
import { ClaimStatusHistoryEntity } from './entities/claim-status-history.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity, ClaimStatusHistoryEntity]),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
