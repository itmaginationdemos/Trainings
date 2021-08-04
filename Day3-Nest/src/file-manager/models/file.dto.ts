import { File } from '../../db/entity/file';
import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty({ readOnly: true })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  ext: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  createdAt: Date;

  constructor(dto?: File | any) {
    this.id = dto.id ? dto.id : undefined;
    this.name = dto.name ? dto.name : undefined;
    this.ext = dto.ext ? dto.ext : undefined;
    this.size = dto.size ? dto.size : undefined;
    this.mimetype = dto.mimetype ? dto.mimetype : undefined;
    this.createdAt = dto.createdAt ? dto.createdAt : undefined;
  }
}
