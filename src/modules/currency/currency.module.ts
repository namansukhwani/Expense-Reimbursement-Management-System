import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { ExchangeRateEntity } from './entities/exchange-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRateEntity])],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
