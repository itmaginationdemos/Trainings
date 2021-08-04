import { Module, OnModuleInit } from '@nestjs/common';
import { StorageService } from './storage.service';
import * as mkdirp from 'mkdirp';
import { join } from 'path';

@Module({
  imports: [],
  controllers: [],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
