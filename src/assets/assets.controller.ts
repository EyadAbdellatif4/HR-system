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
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetFilterDto } from './dto/asset-filter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleName } from '../shared/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { multerConfig } from '../shared/storage/multer.config';

@Controller('assets')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Roles(RoleName.ADMIN)
@ApiTags('Assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Create a new asset',
    description: 'Creates a new asset with optional attachment files (up to 10 files). Files will be stored locally.'
  })
  @ApiBody({ type: CreateAssetDto })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or file upload error' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) createAssetDto: CreateAssetDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.assetsService.create(createAssetDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  findAll(@Query(ValidationPipe) filterDto: AssetFilterDto) {
    return this.assetsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'The asset UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Update an asset',
    description: 'Updates an existing asset with new information. Can include attachment files (up to 10 files) for updating asset images.'
  })
  @ApiBody({ type: UpdateAssetDto })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'The asset UUID' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body(ValidationPipe) updateAssetDto: UpdateAssetDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.assetsService.update(id, updateAssetDto, files);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete an asset',
    description: 'Soft deletes an asset by setting deletedAt timestamp and is_active to false.'
  })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'The asset UUID' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.remove(id);
  }
}

