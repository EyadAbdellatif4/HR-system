import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Department } from './entities/department.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { AuthModule } from '../auth/auth.module';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Department, Role]),
    AuthModule,
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [SequelizeModule, DepartmentsService],
})
export class DepartmentsModule {}
