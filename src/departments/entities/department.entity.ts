import {
  BelongsToMany,
  Column,
  Model,
  PrimaryKey,
  Table,
  Default,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { UserDepartment } from '../../shared/database/entities/user-department.entity';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'departments',
  timestamps: true,
})
export class Department extends Model<Department> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the department' })
  declare id: string;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ example: 'Engineering', description: 'The name of the department' })
  declare name: string;

  @Column({
    type: 'BOOLEAN',
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty({ example: true, description: 'The active status of the department' })
  declare is_active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'The deleted at date of the department' })
  declare deletedAt: Date;

  @BelongsToMany(() => User, () => UserDepartment, 'department_id', 'user_id')
  @ApiProperty({ example: true, description: 'The users in this department' })
  users: User[];
}

