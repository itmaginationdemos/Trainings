import { Module, OnModuleInit } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { FileManagerController } from './controllers/file-manager.controller';
import { FileManagerService } from './services/file-manager.service';
import { StorageModule } from '../shared/storage/storage.module';
import { FileExistsGuard } from './guards/file-exists.guard';

@Module({
  imports: [DbModule, StorageModule],
  controllers: [FileManagerController],
  providers: [FileManagerService, FileExistsGuard],
  exports: [FileExistsGuard],
})
export class FileManagerModule {}
