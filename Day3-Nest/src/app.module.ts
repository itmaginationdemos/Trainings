import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { StorageModule } from './shared/storage/storage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), FileManagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
