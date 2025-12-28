import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Default,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'phones',
  timestamps: true,
})
export class Phone extends Model<Phone> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the phone' })
  declare id: string;

  @Column({
    type: 'VARCHAR(50)',
    allowNull: false,
  })
  @ApiProperty({ example: '+1234567890', description: 'The phone number' })
  declare number: string;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Verizon', description: 'The phone company' })
  declare company: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Unlimited Plan', description: 'The current plan' })
  declare current_plan: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'John Doe', description: 'The legal owner of the phone' })
  declare legal_owner: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  @ApiProperty({ example: 'Company provided phone', description: 'Additional comments' })
  declare comment: string | null;

  @Column({
    type: 'BOOLEAN',
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty({ example: true, description: 'The active status of the phone' })
  declare is_active: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({ example: 'uuid', description: 'The ID of the user' })
  declare user_id: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'The deleted at date of the phone' })
  declare deletedAt: Date;

  @BelongsTo(() => User)
  @ApiProperty({ example: true, description: 'The user who owns this phone' })
  user: User;
}

