import {
  Column,
  Model,
  PrimaryKey,
  Table,
  Default,
  DataType,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
})
export class Attachment extends Model<Attachment> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  @ApiProperty({ example: 'uuid', description: 'The ID of the attachment' })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  @ApiProperty({ example: 'uuid-or-id', description: 'The ID of the entity (user UUID or asset ID)' })
  declare entity_id: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  @ApiProperty({ 
    example: 'users', 
    description: 'The type of entity',
    enum: ['users', 'assets']
  })
  declare entity_type: 'users' | 'assets';

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  @ApiProperty({ example: 'document.pdf', description: 'The name of the file' })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  @ApiProperty({ example: 'application/pdf', description: 'The MIME type of the file' })
  declare type: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  @ApiProperty({ example: '.pdf', description: 'The file extension' })
  declare extension: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  @ApiProperty({ example: 'files/users/1234567890-abc123.pdf', description: 'The path URL of the file' })
  declare path_URL: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty({ example: '2025-01-01T12:00:00Z', description: 'The deletion timestamp', nullable: true })
  declare deleted_at?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty({ example: true, description: 'Whether the attachment is active' })
  declare is_active: boolean;
}

