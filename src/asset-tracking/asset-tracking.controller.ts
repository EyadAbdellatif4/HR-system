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
import { AssetTrackingService } from './asset-tracking.service';
import { CreateAssetTrackingDto } from './dto/create-asset-tracking.dto';
import { UpdateAssetTrackingDto } from './dto/update-asset-tracking.dto';
import { AssetTrackingFilterDto } from './dto/asset-tracking-filter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleName } from '../shared/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('asset-tracking')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Roles(RoleName.ADMIN)
@ApiTags('Asset Tracking')
export class AssetTrackingController {
  constructor(private readonly assetTrackingService: AssetTrackingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset tracking record' })
  @ApiResponse({ status: 201, description: 'Asset tracking created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createAssetTrackingDto: CreateAssetTrackingDto) {
    return this.assetTrackingService.create(createAssetTrackingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all asset tracking records' })
  @ApiResponse({ status: 200, description: 'Asset trackings retrieved successfully' })
  findAll(@Query(ValidationPipe) filterDto: AssetTrackingFilterDto) {
    return this.assetTrackingService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset tracking record by ID' })
  @ApiResponse({ status: 200, description: 'Asset tracking retrieved successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.assetTrackingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset tracking record' })
  @ApiResponse({ status: 200, description: 'Asset tracking updated successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  update(@Param('id') id: string, @Body(ValidationPipe) updateAssetTrackingDto: UpdateAssetTrackingDto) {
    return this.assetTrackingService.update(id, updateAssetTrackingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset tracking record' })
  @ApiResponse({ status: 200, description: 'Asset tracking deleted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.assetTrackingService.remove(id);
  }
}

