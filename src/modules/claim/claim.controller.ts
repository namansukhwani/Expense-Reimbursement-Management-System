import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClaimService } from './claim.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ClaimStatus } from '../../common/enums/claim-status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Auditable } from '../../common/decorators/auditable.decorator';

@UseGuards(JwtAuthGuard)
@Auditable('REIMBURSEMENT_CLAIM')
@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createClaimDto: CreateClaimDto,
  ) {
    const data = await this.claimService.create(userId, createClaimDto);
    return { success: true, data };
  }

  @Get()
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto & { status?: ClaimStatus },
  ) {
    const result = await this.claimService.findAllByUser(userId, query);
    return { success: true, ...result };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.claimService.findById(id, userId);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateClaimDto: UpdateClaimDto,
  ) {
    const data = await this.claimService.update(id, userId, updateClaimDto);
    return { success: true, data };
  }

  @Post(':id/submit')
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.claimService.submit(id, userId);
    return { success: true, data };
  }

  @Post(':id/withdraw')
  async withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.claimService.withdraw(id, userId);
    return { success: true, data };
  }
}
