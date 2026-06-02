import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../modules/auth/entities/user.entity';
import { DepartmentEntity } from '../../modules/department/entities/department.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { ExchangeRateEntity } from '../../modules/currency/entities/exchange-rate.entity';
import { SystemSettingEntity } from '../../modules/settings/entities/system-setting.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import dataSource from '../data-source';

async function runSeeder() {
  await dataSource.initialize();
  console.log('Database connected');

  const deptRepo = dataSource.getRepository(DepartmentEntity);
  const userRepo = dataSource.getRepository(UserEntity);
  const catRepo = dataSource.getRepository(CategoryEntity);
  const rateRepo = dataSource.getRepository(ExchangeRateEntity);
  const settingsRepo = dataSource.getRepository(SystemSettingEntity);

  // 1. Departments
  console.log('Seeding Departments...');
  let engDept = await deptRepo.findOne({ where: { name: 'Engineering' } });
  if (!engDept) {
    engDept = deptRepo.create({
      name: 'Engineering',
      allocatedBudget: 100000,
      budgetCurrency: 'USD',
    });
    await deptRepo.save(engDept);
  }

  let mktDept = await deptRepo.findOne({ where: { name: 'Marketing' } });
  if (!mktDept) {
    mktDept = deptRepo.create({
      name: 'Marketing',
      allocatedBudget: 50000,
      budgetCurrency: 'USD',
    });
    await deptRepo.save(mktDept);
  }

  // 2. Categories
  console.log('Seeding Categories...');
  const categories = [
    { name: 'Travel', reimbursementLimit: 2000, limitCurrency: 'USD' },
    { name: 'Meals', reimbursementLimit: 100, limitCurrency: 'USD' },
    { name: 'Office Supplies', reimbursementLimit: 500, limitCurrency: 'USD' },
    { name: 'Software', reimbursementLimit: 1000, limitCurrency: 'USD' },
    { name: 'Equipment', reimbursementLimit: 3000, limitCurrency: 'USD' },
  ];

  for (const cat of categories) {
    const existing = await catRepo.findOne({ where: { name: cat.name } });
    if (!existing) {
      await catRepo.save(catRepo.create(cat));
    }
  }

  // 3. Users
  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('secret123', 10);

  let admin = await userRepo.findOne({
    where: { email: 'admin@payoneer.com' },
  });
  if (!admin) {
    admin = userRepo.create({
      email: 'admin@payoneer.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
  }

  let manager = await userRepo.findOne({
    where: { email: 'manager@payoneer.com' },
  });
  if (!manager) {
    manager = userRepo.create({
      email: 'manager@payoneer.com',
      passwordHash,
      firstName: 'Eng',
      lastName: 'Manager',
      role: UserRole.MANAGER,
      departmentId: engDept.id,
    });
    await userRepo.save(manager);
  }

  let employee = await userRepo.findOne({
    where: { email: 'employee@payoneer.com' },
  });
  if (!employee) {
    employee = userRepo.create({
      email: 'employee@payoneer.com',
      passwordHash,
      firstName: 'Software',
      lastName: 'Engineer',
      role: UserRole.EMPLOYEE,
      departmentId: engDept.id,
      reportingManagerId: manager.id,
    });
    await userRepo.save(employee);
  }

  // 4. Exchange Rates
  console.log('Seeding Exchange Rates...');
  const rates = [
    {
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      rate: 0.92,
      effectiveFrom: new Date(),
    },
    {
      sourceCurrency: 'USD',
      targetCurrency: 'INR',
      rate: 83.0,
      effectiveFrom: new Date(),
    },
    {
      sourceCurrency: 'EUR',
      targetCurrency: 'INR',
      rate: 90.0,
      effectiveFrom: new Date(),
    },
  ];

  for (const rate of rates) {
    const existing = await rateRepo.findOne({
      where: {
        sourceCurrency: rate.sourceCurrency,
        targetCurrency: rate.targetCurrency,
      },
    });
    if (!existing) {
      await rateRepo.save(rateRepo.create(rate));
    }
  }

  // 5. System Settings
  console.log('Seeding Settings...');
  const setting = await settingsRepo.findOne({
    where: { settingKey: 'BASE_CURRENCY' },
  });
  if (!setting) {
    await settingsRepo.save(
      settingsRepo.create({ settingKey: 'BASE_CURRENCY', settingValue: 'USD' }),
    );
  }

  console.log('Seeding Complete!');
  await dataSource.destroy();
}

runSeeder().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
