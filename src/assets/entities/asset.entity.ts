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
import { Attachment } from '../../shared/database/entities/attachment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'assets',
  timestamps: true,
})
export class Asset extends Model<Asset> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the asset' })
  declare id: string;

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
    type: DataType.ENUM('phone', 'mobile', 'laptop'),
    allowNull: true,
  })
  @ApiProperty({ 
    example: 'laptop', 
    description: 'The asset type',
    enum: ['phone', 'mobile', 'laptop']
  })
  declare asset_type: 'phone' | 'mobile' | 'laptop' | null;

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
  @ApiProperty({ example: '16GB', description: 'The RAM of the asset' })
  declare ram: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Intel i7-12700H', description: 'The laptop processor of the asset' })
  declare laptop_processor: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '512GB', description: 'The laptop SSD of the asset' })
  declare laptop_ssd: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '1TB', description: 'The laptop HDD of the asset' })
  declare laptop_hdd: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'NVIDIA RTX 3060', description: 'The laptop graphics card of the asset' })
  declare laptop_graphics_card: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Dell 27" 4K', description: 'The laptop monitor of the asset' })
  declare laptop_monitor: string | null;

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
  @ApiProperty({ example: '123456789012345', description: 'The first mobile IMEI of the asset' })
  declare mobile_imei_1: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '123456789012346', description: 'The second mobile IMEI of the asset' })
  declare mobile_imei_2: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '128GB', description: 'The mobile internal memory of the asset' })
  declare mobile_internal_memory: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: '256GB', description: 'The mobile external memory of the asset' })
  declare mobile_external_memory: string | null;

  @Column({
    type: 'VARCHAR(50)',
    allowNull: true,
  })
  @ApiProperty({ example: '+1234567890', description: 'The phone number of the asset' })
  declare phone_number: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Verizon', description: 'The phone company of the asset' })
  declare phone_company: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'Unlimited Plan', description: 'The phone current plan of the asset' })
  declare phone_current_plan: string | null;

  @Column({
    type: 'VARCHAR(255)',
    allowNull: true,
  })
  @ApiProperty({ example: 'John Doe', description: 'The phone legal owner of the asset' })
  declare phone_legal_owner: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  @ApiProperty({ example: 'Company provided phone', description: 'The phone comment of the asset' })
  declare phone_comment: string | null;

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

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty({ example: true, description: 'Whether the asset is active' })
  declare is_active: boolean;

  @HasMany(() => AssetTracking)
  @ApiProperty({ example: true, description: 'The tracking records for this asset' })
  assetTrackings: AssetTracking[];

  @BelongsToMany(() => User, () => AssetTracking, 'asset_id', 'user_id')
  @ApiProperty({ example: true, description: 'The users assigned to this asset' })
  users: User[];

  @HasMany(() => Attachment, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
      entity_type: 'assets',
    },
    as: 'attachments',
  })
  @ApiProperty({ example: true, description: 'The attachments associated with this asset' })
  attachments: Attachment[];
}

