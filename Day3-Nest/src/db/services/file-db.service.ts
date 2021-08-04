import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { File } from '../entity/file';
import { Model, ModelCtor, ModelType } from 'sequelize-typescript';

@Injectable()
export class FileDbService {
  constructor(
    @Inject('DB_REPOSITORY-FILE') protected readonly dbService: ModelCtor<File>,
  ) {}

  async getList(): Promise<File[]> {
    return this.dbService.findAll();
  }

  async getById(id: number): Promise<File | null> {
    return this.dbService.findByPk(id);
  }

  async delete(entity: File): Promise<true> {
    await entity.destroy();

    return true;
  }
  async deleteById(id: number): Promise<boolean> {
    const entity = await this.getById(id);
    if (!entity) return false;

    return this.delete(entity);
  }

  async create(data: Exclude<File, keyof Model<File>> | any): Promise<File> {
    return this.dbService.build(data);
  }
}
