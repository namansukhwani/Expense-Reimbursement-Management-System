import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import storageConfig from './config/storage.config';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { CategoryModule } from './modules/category/category.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { AuditModule } from './modules/audit/audit.module';
import { ClaimModule } from './modules/claim/claim.module';
import { BudgetModule } from './modules/budget/budget.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, storageConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: true, // Use false in production and use migrations
      }),
    }),
    AuthModule,
    DepartmentModule,
    CategoryModule,
    CurrencyModule,
    SettingsModule,
    ExpenseModule,
    AuditModule,
    ClaimModule,
    BudgetModule,
    ApprovalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
