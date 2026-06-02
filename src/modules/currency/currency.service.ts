import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRateEntity } from './entities/exchange-rate.entity';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { Money } from './value-objects/money.vo';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(ExchangeRateEntity)
    private readonly exchangeRateRepo: Repository<ExchangeRateEntity>,
  ) {}

  async create(dto: CreateExchangeRateDto): Promise<ExchangeRateEntity> {
    const existing = await this.exchangeRateRepo.findOne({
      where: {
        sourceCurrency: dto.sourceCurrency,
        targetCurrency: dto.targetCurrency,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Exchange rate for this currency pair already exists.',
      );
    }

    const rate = this.exchangeRateRepo.create(dto);
    return this.exchangeRateRepo.save(rate);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ExchangeRateEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.exchangeRateRepo.findAndCount({
      skip,
      take: limit,
      order: {
        effectiveFrom: 'DESC',
      },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async delete(id: string): Promise<void> {
    const result = await this.exchangeRateRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exchange Rate #${id} not found`);
    }
  }

  async getRate(
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<number> {
    if (sourceCurrency === targetCurrency) return 1;

    const rateEntity = await this.exchangeRateRepo.findOne({
      where: { sourceCurrency, targetCurrency },
      order: { effectiveFrom: 'DESC' },
    });

    if (!rateEntity) {
      throw new NotFoundException(
        `Exchange rate from ${sourceCurrency} to ${targetCurrency} not found`,
      );
    }

    return rateEntity.rate;
  }

  async convert(
    amount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<Money> {
    const rate = await this.getRate(sourceCurrency, targetCurrency);
    const sourceMoney = new Money(amount, sourceCurrency);
    return sourceMoney.toBase(rate, targetCurrency);
  }
}
