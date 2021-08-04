import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { FileDbService } from '../../db/services/file-db.service';
import { FieldRequestPosition } from '../decorators/interfaces/field-request-position.interface';

@Injectable()
export class FileExistsGuard implements CanActivate {
  constructor(private reflector: Reflector, private service: FileDbService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const fieldPosition = this.reflector.get<FieldRequestPosition>(
      'fileIdPosition',
      context.getHandler(),
    );

    const fileIdString = request[fieldPosition.position][fieldPosition.field];
    const fileId = parseInt(
      typeof fileIdString === 'string' ? fileIdString : '',
    );

    const entity = await this.service.getById(fileId);
    if (!entity) throw new NotFoundException();

    // console.log(fieldPosition, 'fileId', fileId);

    return true;
  }
}
