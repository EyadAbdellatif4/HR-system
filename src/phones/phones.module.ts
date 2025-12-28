import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Phone } from './entities/phone.entity';
import { PhonesService } from './phones.service';
import { PhonesController } from './phones.controller';
import { AuthModule } from '../auth/auth.module';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Phone, Role]),
    AuthModule,
  ],
  controllers: [PhonesController],
  providers: [PhonesService],
  exports: [SequelizeModule, PhonesService],
})
export class PhonesModule {}
