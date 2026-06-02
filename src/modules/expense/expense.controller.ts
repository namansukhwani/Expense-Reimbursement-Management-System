import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Auditable } from '../../common/decorators/auditable.decorator';

@UseGuards(JwtAuthGuard)
@Auditable('EXPENSE')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    const data = await this.expenseService.create(userId, createExpenseDto);
    return { success: true, data };
  }

  @Get()
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const result = await this.expenseService.findAllByUser(userId, query);
    return { success: true, ...result };
  }

  @Get('unattached')
  async findUnattachedReimbursable(@CurrentUser('sub') userId: string) {
    const data = await this.expenseService.findUnattachedReimbursable(userId);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.expenseService.findById(id, userId);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const data = await this.expenseService.update(id, userId, updateExpenseDto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.expenseService.delete(id, userId);
    return { success: true, message: 'Expense deleted successfully' };
  }

  @Post(':id/receipt')
  @UseInterceptors(FileInterceptor('receipt'))
  async uploadReceipt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.expenseService.uploadReceipt(id, userId, file);
    return { success: true, data };
  }

  @Get(':id/receipt')
  async downloadReceipt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.expenseService.downloadReceipt(id, userId);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="receipt-${id}"`,
    });
    return new StreamableFile(buffer);
  }

  @Delete(':id/receipt')
  async deleteReceipt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.expenseService.deleteReceipt(id, userId);
    return { success: true, data };
  }
}
