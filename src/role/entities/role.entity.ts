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

/**
 * Role is a model that represents a role
 */
@Table({
  tableName: 'roles',
  timestamps: true,
})
/**
 * Role is a model that represents a role
 */
export class Role extends Model<Role> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the role' })
  declare id: string;

  @Column({
    type: 'VARCHAR(50)',
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ example: 'admin', description: 'The name of the role' })
  declare name: string;

  @Column({
    type: 'BOOLEAN',
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty({ example: true, description: 'The active status of the role' })
  declare is_active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'The deleted at date of the role' })
  declare deletedAt: Date;

  @HasMany(() => User)
  @ApiProperty({ example: true, description: 'The users of the role' })
  users: User[];
}
