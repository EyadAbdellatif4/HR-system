import {
  BelongsToMany,
  Column,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Default,
  AutoIncrement,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { AssetTracking } from '../../asset-tracking/entities/asset-tracking.entity';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'assets',
  timestamps: true,
})
export class Asset extends Model<Asset> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @ApiProperty({ example: 1, description: 'The ID of the asset' })
  declare id: number;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Laptop-001', description: 'The label of the asset' })
  declare label: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Laptop', description: 'The type of the asset' })
  declare type: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Dell XPS 15', description: 'The model of the asset' })
  declare model: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'SN123456789', description: 'The serial number of the asset' })
  declare serial_number: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Intel i7-12700H', description: 'The processor of the asset' })
  declare processor: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '512GB', description: 'The SSD of the asset' })
  declare ssd: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '1TB', description: 'The HDD of the asset' })
  declare hdd: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '16GB', description: 'The RAM of the asset' })
  declare ram: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'NVIDIA RTX 3060', description: 'The graphics card of the asset' })
  declare graphics_card: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Dell 27" 4K', description: 'The monitor of the asset' })
  declare monitor: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Active', description: 'The status of the asset' })
  declare status: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '123456789012345', description: 'The first IMEI of the asset' })
  declare imei_1: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '123456789012346', description: 'The second IMEI of the asset' })
  declare imei_2: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '128GB', description: 'The internal memory of the asset' })
  declare internal_memory: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '256GB', description: 'The external memory of the asset' })
  declare external_memory: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  @ApiProperty({ example: 'Additional details about the asset', description: 'Additional details' })
  declare details: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01 12:00:00', description: 'The deleted at date of the asset' })
  declare deletedAt: Date;

  @HasMany(() => AssetTracking)
  @ApiProperty({ example: true, description: 'The tracking records for this asset' })
  assetTrackings: AssetTracking[];

  @BelongsToMany(() => User, () => AssetTracking, 'asset_id', 'user_id')
  @ApiProperty({ example: true, description: 'The users assigned to this asset' })
  users: User[];
}

