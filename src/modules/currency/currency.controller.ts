import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('exchange-rates')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  async create(@Body() createExchangeRateDto: CreateExchangeRateDto) {
    const data = await this.currencyService.create(createExchangeRateDto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.currencyService.findAll(query);
    return { success: true, ...result };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.currencyService.delete(id);
    return { success: true, message: 'Exchange rate deleted successfully' };
  }
}
