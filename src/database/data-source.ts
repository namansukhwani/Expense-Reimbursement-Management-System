import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from '../modules/auth/entities/user.entity';
import { DepartmentEntity } from '../modules/department/entities/department.entity';
import { CategoryEntity } from '../modules/category/entities/category.entity';
import { ExchangeRateEntity } from '../modules/currency/entities/exchange-rate.entity';
import { SystemSettingEntity } from '../modules/settings/entities/system-setting.entity';
import { ExpenseEntity } from '../modules/expense/entities/expense.entity';
import { AuditLogEntity } from '../modules/audit/entities/audit-log.entity';
import { ClaimStatusHistoryEntity } from '../modules/audit/entities/claim-status-history.entity';
import { ReimbursementClaimEntity } from '../modules/claim/entities/reimbursement-claim.entity';

// Load .env variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'expense_user',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_DATABASE || 'expense_reimbursement',
  synchronize: false,
  logging: true,
  entities: [UserEntity, DepartmentEntity, CategoryEntity, ExchangeRateEntity, SystemSettingEntity, ExpenseEntity, AuditLogEntity, ClaimStatusHistoryEntity, ReimbursementClaimEntity], // Add future entities here
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
