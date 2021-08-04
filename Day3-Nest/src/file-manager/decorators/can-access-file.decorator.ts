import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { FileExistsGuard } from '../guards/file-exists.guard';
import { FileIdPosition } from './file-id-position.decorator';
import { Position } from './interfaces/field-request-position.interface';
import { FilePasswordPosition } from './file-password-position.decorator';

export function CanAccessFile(
  fileIdField: string,
  fileIdPosition: Position = 'params',
  passField: string = 'pass',
  passFieldPosition: Position = 'query',
) {
  return applyDecorators(
    FilePasswordPosition(passField, passFieldPosition),
    FileIdPosition(fileIdField, fileIdPosition),
    UseGuards(FileExistsGuard),
  );
}
