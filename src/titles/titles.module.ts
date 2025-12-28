import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Title } from './entities/title.entity';
import { TitlesService } from './titles.service';
import { TitlesController } from './titles.controller';
import { AuthModule } from '../auth/auth.module';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Title, Role]),
    AuthModule,
  ],
  controllers: [TitlesController],
  providers: [TitlesService],
  exports: [SequelizeModule, TitlesService],
})
export class TitlesModule {}
