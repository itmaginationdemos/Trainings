import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileManagerService } from '../services/file-manager.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFileType } from '../../_types/uploaded-file-type';
import { join } from 'path';
import { ChangePasswordDto } from '../models/change-password.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileDto } from '../models/file.dto';
import { StorageService } from '../../shared/storage/storage.service';
import { Response } from 'express';
import { FileExistsGuard } from '../guards/file-exists.guard';
import { FileExists } from '../decorators/file-exists.decorator';
import { File } from '../../db/entity/file';
import { CanAccessFile } from '../decorators/can-access-file.decorator';

@Controller('file-manager')
@ApiInternalServerErrorResponse({ description: 'Jebnęło' })
@ApiTags('files')
export class FileManagerController {
  protected readonly uploadDir = join(
    __dirname,
    '..',
    '..',
    '..',
    'public',
    'uploads',
  );

  constructor(
    private readonly dbService: FileManagerService,
    private readonly storageService: StorageService,
  ) {}

  @Get('/')
  async getList() {
    return this.dbService.getList();
  }

  @Put('/')
  @ApiOkResponse({
    description: 'Dane utworzonego obiektu',
    type: () => FileDto,
  })
  @ApiOperation({
    summary: 'send file',
    description: 'receives the file and saves on hard drive and database',
    operationId: 'fileManager_store',
  })
  @UseInterceptors(FileInterceptor('file'))
  async handleFile(@UploadedFile() file: UploadedFileType) {
    // sprawdzśmy czy plik ok
    if (!file || !file.buffer) throw new BadRequestException();

    // zapisać plik na dysku
    const randomedName = `${new Date().getTime()}-${Math.random()}`;
    await this.storageService.saveFile(randomedName, file.buffer);

    // dodaj do bazy
    try {
      return this.dbService.create({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        ext:
          file.originalname.substring(
            file.originalname.length - 4,
            file.originalname.length,
          ) || '',
        ourname: randomedName,
      });
    } catch (err) {
      try {
        // nie chcemy by user widział że nie umieliśmy usunać jego pliku, ktory własnie wysłał do nas
        await this.storageService.removeFile(randomedName);
      } catch (err) {
        console.error('Logged error', err);
      }
      throw new InternalServerErrorException();
    }
  }

  @Post('/:id')
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ required: true, type: () => ChangePasswordDto })
  @ApiConflictResponse({ description: 'Password already set. Cannot change.' })
  @ApiOkResponse({})
  @ApiOperation({
    description: 'Dokładna instrukcja',
    summary: 'Szybka informacja',
  })
  async changePassword(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe()) dto: ChangePasswordDto,
  ) {
    return this.dbService.changePassword(id, dto);
  }

  @Delete('/:id')
  async deleteFile(@Param('id', new ParseIntPipe()) id: number) {
    return this.dbService.delete(id);
  }

  @CanAccessFile('fileId')
  @Get('/meta/:fileId')
  async getMeta(@Param('fileId', new ParseIntPipe()) id: number) {
    const entity = await File.findByPk(id);
    return Object.assign({}, entity.get({ plain: true }), {
      pass: '--- redacted ---',
    }); // simple
    // return entity.get({plain: true});
  }

  @FileExists('id')
  @Get('/:id')
  @ApiParam({ name: 'id' })
  async fetchFile(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ) {
    // const entity = await this.dbService.getFileDataForStream(id);
    try {
      const { stream, mimetype } = await this.dbService.getFileStream(id);

      res.contentType(mimetype);
      stream.pipe(res);
    } catch (err) {
      return res
        .status(500)
        .json({ statusCode: 500, message: 'Could not read file' });
    }
  }
}
