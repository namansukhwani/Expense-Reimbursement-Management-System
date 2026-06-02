import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<DepartmentEntity> {
    const department = this.departmentRepo.create(dto);
    return this.departmentRepo.save(department);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<DepartmentEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.departmentRepo.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
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

  async findOne(id: string): Promise<DepartmentEntity> {
    const department = await this.departmentRepo.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department #${id} not found`);
    }
    return department;
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const department = await this.findOne(id);
    this.departmentRepo.merge(department, dto);
    return this.departmentRepo.save(department);
  }

  async updateBudget(id: string, newBudget: number): Promise<DepartmentEntity> {
    const department = await this.findOne(id);
    department.allocatedBudget = newBudget;
    return this.departmentRepo.save(department);
  }
}
