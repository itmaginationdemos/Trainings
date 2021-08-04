import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { FileDbService } from '../../db/services/file-db.service';
import { FieldRequestPosition } from '../decorators/interfaces/field-request-position.interface';

@Injectable()
export class CanAccessFileGuard implements CanActivate {
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

    const passPosition = this.reflector.get<FieldRequestPosition>(
      'filePasswordPosition',
      context.getHandler(),
    );

    const password = request[passPosition.position][passPosition.field];

    const entity = await this.service.getById(fileId);
    if (!entity) throw new NotFoundException();

    if (!entity.pass || entity.pass === password) {
      return true;
    }

    return false;
  }
}
