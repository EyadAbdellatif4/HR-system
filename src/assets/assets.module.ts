import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Asset } from './entities/asset.entity';
import { Attachment } from '../shared/database/entities/attachment.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AuthModule } from '../auth/auth.module';
import { Role } from '../role/entities/role.entity';
import { StorageModule } from '../shared/storage/storage.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Asset, Attachment, Role]),
    AuthModule,
    StorageModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [SequelizeModule, AssetsService],
})
export class AssetsModule {}
