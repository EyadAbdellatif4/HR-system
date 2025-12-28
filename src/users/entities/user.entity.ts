import {
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Default,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { Role } from '../../role/entities/role.entity';
import { Title } from '../../titles/entities/title.entity';
import { Phone } from '../../phones/entities/phone.entity';
import { Department } from '../../departments/entities/department.entity';
import { UserDepartment } from '../../shared/database/entities/user-department.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { AssetTracking } from '../../asset-tracking/entities/asset-tracking.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * User is a model that represents a user
 */
@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the user' })
  declare id: string;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: false,
    unique: true,
  })
  @ApiProperty({ example: 'EMP001', description: 'The user number' })
  declare user_number: string;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
    unique: true,
  })
  @ApiProperty({ example: 'eyad@gmail.com', description: 'The username/email of the user' })
  declare username: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'hashed_password', description: 'The password of the user' })
  declare password: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: false,
  })
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  declare name: string;

  @Column({
    type: 'VARCHAR(500)',
    allowNull: false,
  })
  @ApiProperty({ example: '123 Main St, City, Country', description: 'The address of the user' })
  declare address: string;

  @Column({
    type: DataType.ENUM('in-office', 'hybrid', 'remote'),
    allowNull: false,
  })
  @ApiProperty({ 
    example: 'hybrid', 
    description: 'The work location type',
    enum: ['in-office', 'hybrid', 'remote']
  })
  declare work_location: 'in-office' | 'hybrid' | 'remote';

  @Column({
    type: 'BOOLEAN',
    allowNull: false,
  })
  @ApiProperty({ example: true, description: 'Whether the user has social insurance' })
  declare social_insurance: boolean;

  @Column({
    type: 'BOOLEAN',
    allowNull: false,
  })
  @ApiProperty({ example: true, description: 'Whether the user has medical insurance' })
  declare medical_insurance: boolean;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  @ApiProperty({ example: '2025-01-01', description: 'The join date of the user' })
  declare join_date: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-12-31', description: 'The contract date of the user (optional)' })
  declare contract_date: Date | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  @ApiProperty({ example: '2026-12-31', description: 'The exit date of the user (optional)' })
  declare exit_date: Date | null;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({ example: 'uuid', description: 'The ID of the role' })
  declare role_id: string;

  @ForeignKey(() => Title)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  @ApiProperty({ example: 'uuid', description: 'The ID of the title' })
  declare title_id: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'The deleted at date of the user' })
  declare deletedAt: Date;

  @BelongsTo(() => Role)
  @ApiProperty({ example: true, description: 'The role of the user' })
  role: Role;

  @BelongsTo(() => Title)
  @ApiProperty({ example: true, description: 'The title of the user' })
  title: Title;

  @HasMany(() => Phone)
  @ApiProperty({ example: true, description: 'The phones of the user' })
  phones: Phone[];

  @BelongsToMany(() => Department, () => UserDepartment, 'user_id', 'department_id')
  @ApiProperty({ example: true, description: 'The departments of the user' })
  departments: Department[];

  @HasMany(() => AssetTracking)
  @ApiProperty({ example: true, description: 'The asset tracking records for this user' })
  assetTrackings: AssetTracking[];

  @BelongsToMany(() => Asset, () => AssetTracking, 'user_id', 'asset_id')
  @ApiProperty({ example: true, description: 'The assets assigned to this user' })
  assets: Asset[];
}

