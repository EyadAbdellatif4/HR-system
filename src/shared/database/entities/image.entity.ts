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
  tableName: 'images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Image extends Model<Image> {
  @PrimaryKey
  @Default(DataType.BIGINT)
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
  })
  @ApiProperty({ example: 1, description: 'The ID of the image' })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  @ApiProperty({ example: 'uuid-or-id', description: 'The ID of the owner (user UUID or asset ID)' })
  declare owner_id: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  @ApiProperty({ 
    example: 'user', 
    description: 'The type of owner',
    enum: ['user', 'asset']
  })
  declare owner_type: 'user' | 'asset';

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'The URL of the image' })
  declare image_url: string;
}

