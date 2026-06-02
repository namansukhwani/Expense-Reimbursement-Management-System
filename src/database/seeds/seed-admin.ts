import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../modules/auth/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import databaseConfig from '../../config/database.config';

async function seedAdmin() {
  const config = databaseConfig();

  const dataSource = new DataSource({
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    entities: [UserEntity],
  });

  await dataSource.initialize();
  console.log('Database connected');

  const userRepository = dataSource.getRepository(UserEntity);

  const adminEmail = 'admin@company.com';
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
  } else {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: adminEmail,
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully.');
  }

  await dataSource.destroy();
}

seedAdmin().catch((err) => {
  console.error('Error seeding admin user:', err);
  process.exit(1);
});
