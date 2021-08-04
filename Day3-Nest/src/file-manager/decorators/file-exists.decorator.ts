import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { FileExistsGuard } from '../guards/file-exists.guard';
import { FileIdPosition } from './file-id-position.decorator';
import { Position } from './interfaces/field-request-position.interface';

export function FileExists(
  fileIdField: string,
  fileIdPosition: Position = 'params',
) {
  return applyDecorators(
    SetMetadata('a', 'b'),
    FileIdPosition(fileIdField, fileIdPosition),
    UseGuards(FileExistsGuard),
  );
}
