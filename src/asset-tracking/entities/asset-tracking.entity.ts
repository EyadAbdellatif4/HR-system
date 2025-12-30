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
import { Asset } from '../../assets/entities/asset.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'asset_tracking',
  timestamps: true,
})
export class AssetTracking extends Model<AssetTracking> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the asset tracking record' })
  declare id: string;

  @ForeignKey(() => Asset)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ApiProperty({ example: 'uuid', description: 'The ID of the asset' })
  declare asset_id: string;

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
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'When the asset was assigned' })
  declare assigned_at: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-12-31 12:00:00', description: 'When the asset was removed' })
  declare removed_at: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'The deleted at date' })
  declare deletedAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty({ example: true, description: 'Whether the asset tracking record is active' })
  declare is_active: boolean;

  @BelongsTo(() => Asset)
  @ApiProperty({ example: true, description: 'The asset being tracked' })
  asset: Asset;

  @BelongsTo(() => User)
  @ApiProperty({ example: true, description: 'The user assigned to the asset' })
  user: User;
}

