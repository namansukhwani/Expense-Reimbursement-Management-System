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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Auditable } from '../../common/decorators/auditable.decorator';

@UseGuards(JwtAuthGuard)
@Auditable('DEPARTMENT')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const data = await this.departmentService.create(createDepartmentDto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.departmentService.findAll(query);
    return { success: true, ...result };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.departmentService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const data = await this.departmentService.update(id, updateDepartmentDto);
    return { success: true, data };
  }

  @Patch(':id/budget')
  async updateBudget(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('allocatedBudget') allocatedBudget: number,
  ) {
    const data = await this.departmentService.updateBudget(id, allocatedBudget);
    return { success: true, data };
  }
}
