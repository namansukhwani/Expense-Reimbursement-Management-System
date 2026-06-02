import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { PartialApproveClaimDto } from './dto/partial-approve-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('pending')
  async findPending(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const result = await this.approvalService.findPendingForManager(
      userId,
      query,
    );
    return { success: true, ...result };
  }

  @Get('history')
  async findHistory(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const result = await this.approvalService.findApprovalHistory(
      userId,
      query,
    );
    return { success: true, ...result };
  }

  @Post('claims/:id/approve')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ApproveClaimDto,
  ) {
    const data = await this.approvalService.approve(id, userId, dto);
    return { success: true, data };
  }

  @Post('claims/:id/partial-approve')
  async partialApprove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: PartialApproveClaimDto,
  ) {
    const data = await this.approvalService.partialApprove(id, userId, dto);
    return { success: true, data };
  }

  @Post('claims/:id/reject')
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: RejectClaimDto,
  ) {
    const data = await this.approvalService.reject(id, userId, dto);
    return { success: true, data };
  }
}
