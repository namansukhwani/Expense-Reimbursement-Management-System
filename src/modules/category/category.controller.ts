import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Auditable } from '../../common/decorators/auditable.decorator';

@UseGuards(JwtAuthGuard)
@Auditable('CATEGORY')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoryService.create(createCategoryDto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.categoryService.findAll(query);
    return { success: true, ...result };
  }

  @Get('active')
  async findActive() {
    const data = await this.categoryService.findActiveCategories();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.categoryService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoryService.update(id, updateCategoryDto);
    return { success: true, data };
  }
}
