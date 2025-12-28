import {
  Column,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Default,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'titles',
  timestamps: true,
})
export class Title extends Model<Title> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the title' })
  declare id: string;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ example: 'Software Engineer', description: 'The name of the title' })
  declare name: string;

  @Column({
    type: 'BOOLEAN',
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty({ example: true, description: 'The active status of the title' })
  declare is_active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'The deleted at date of the title' })
  declare deletedAt: Date;

  @HasMany(() => User)
  @ApiProperty({ example: true, description: 'The users with this title' })
  users: User[];
}

