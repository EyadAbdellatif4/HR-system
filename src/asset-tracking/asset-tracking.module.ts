import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AssetTracking } from './entities/asset-tracking.entity';
import { AssetTrackingService } from './asset-tracking.service';
import { AssetTrackingController } from './asset-tracking.controller';
import { AuthModule } from '../auth/auth.module';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([AssetTracking, Role]),
    AuthModule,
  ],
  controllers: [AssetTrackingController],
  providers: [AssetTrackingService],
  exports: [SequelizeModule, AssetTrackingService],
})
export class AssetTrackingModule {}
