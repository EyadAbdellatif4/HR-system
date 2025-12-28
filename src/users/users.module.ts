import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Phone } from '../phones/entities/phone.entity';
import { Role } from '../role/entities/role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Phone, Role]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [SequelizeModule, UsersService],
})
export class UsersModule {}

