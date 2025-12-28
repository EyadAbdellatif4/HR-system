import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Asset } from './entities/asset.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AuthModule } from '../auth/auth.module';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Asset, Role]),
    AuthModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [SequelizeModule, AssetsService],
})
export class AssetsModule {}
