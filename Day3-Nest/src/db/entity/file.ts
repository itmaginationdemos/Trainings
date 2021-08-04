import {
  AllowNull,
  Column,
  DataType,
  Model,
  NotNull,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'files',
  paranoid: true,
})
export class File extends Model<File> {
  @AllowNull(false)
  @Column(DataType.STRING(100))
  name: string;

  @AllowNull(false)
  @Column(DataType.STRING(35))
  path: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  ext: string;

  @AllowNull(false)
  @Column(DataType.STRING(35))
  mimetype: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  size: number;

  @Column(DataType.STRING(50))
  pass?: string;
}
