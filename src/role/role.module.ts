import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Role]),
        AuthModule,
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService], 
})
export class RoleModule {}
