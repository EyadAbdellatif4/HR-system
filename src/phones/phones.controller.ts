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
import { PhonesService } from './phones.service';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { PhoneFilterDto } from './dto/phone-filter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleName } from '../shared/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('phones')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Roles(RoleName.ADMIN)
@ApiTags('Phones')
export class PhonesController {
  constructor(private readonly phonesService: PhonesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new phone' })
  @ApiResponse({ status: 201, description: 'Phone created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createPhoneDto: CreatePhoneDto) {
    return this.phonesService.create(createPhoneDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all phones' })
  @ApiResponse({ status: 200, description: 'Phones retrieved successfully' })
  findAll(@Query(ValidationPipe) filterDto: PhoneFilterDto) {
    return this.phonesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a phone by ID' })
  @ApiResponse({ status: 200, description: 'Phone retrieved successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.phonesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a phone' })
  @ApiResponse({ status: 200, description: 'Phone updated successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  update(@Param('id') id: string, @Body(ValidationPipe) updatePhoneDto: UpdatePhoneDto) {
    return this.phonesService.update(id, updatePhoneDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a phone' })
  @ApiResponse({ status: 200, description: 'Phone deleted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.phonesService.remove(id);
  }
}

