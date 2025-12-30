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
import { User } from '../../../users/entities/user.entity';
import { Department } from '../../../departments/entities/department.entity';

@Table({
  tableName: 'user_departments',
  timestamps: true,
})
export class UserDepartment extends Model<UserDepartment> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare department_id: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare deleted_at?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Department)
  department: Department;
}

