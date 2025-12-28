import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { TitleFilterDto } from './dto/title-filter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleName } from '../shared/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('titles')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Roles(RoleName.ADMIN)
@ApiTags('Titles')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new title' })
  @ApiResponse({ status: 201, description: 'Title created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createTitleDto: CreateTitleDto) {
    return this.titlesService.create(createTitleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all titles' })
  @ApiResponse({ status: 200, description: 'Titles retrieved successfully' })
  findAll(@Query(ValidationPipe) filterDto: TitleFilterDto) {
    return this.titlesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a title by ID' })
  @ApiResponse({ status: 200, description: 'Title retrieved successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.titlesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a title' })
  @ApiResponse({ status: 200, description: 'Title updated successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  update(@Param('id') id: string, @Body(ValidationPipe) updateTitleDto: UpdateTitleDto) {
    return this.titlesService.update(id, updateTitleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a title' })
  @ApiResponse({ status: 200, description: 'Title deleted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.titlesService.remove(id);
  }
}

