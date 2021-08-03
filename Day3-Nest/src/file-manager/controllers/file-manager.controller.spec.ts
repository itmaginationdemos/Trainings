import { Test, TestingModule } from '@nestjs/testing';
import { FileManagerController } from './file-manager.controller';
import {DbModule} from "../../db/db.module";
import {FileManagerService} from "../services/file-manager.service";
import {StorageModule} from "../../shared/storage/storage.module";
import * as sinon from 'sinon';

describe('FileManagerController', () => {
  let controller: FileManagerController;

  let newFileId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbModule, StorageModule],
      controllers: [FileManagerController],
      providers: [FileManagerService],
    }).compile();

    controller = module.get<FileManagerController>(FileManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it ('Send file', async () => {
    const fileMeta = await controller.handleFile({
      buffer: Buffer.from('Jestem sobie pliczek'),
      originalname: 'test.txt',
      size: 50,
      mimetype: 'application/text',
      encoding: 'ascii',
      fieldname: 'file',
    });

    expect(fileMeta).toBeDefined();
    expect(fileMeta.name).toEqual('test.txt');
    newFileId = fileMeta.id;
  });

  it ('Fetch file', async () => {
    const jsonFunction = {json: sinon.mock()};
    const file = await controller.fetchFile(newFileId, {
      on: sinon.spy(), once: sinon.spy(),  // this are used by stream.pipe
      contentType: sinon.mock(), status: sinon.mock().returns(jsonFunction) // this are used by us (or error)
    } as any);
  });

  it ('Fetch non existing file', async () => {
    try {
      const file = await controller.fetchFile(0, {} as any);
    } catch (err) {
      // sprawdzić jaki bład
      /// expect oczekujemy na  .path of undefined

      return;
    }

    throw new Error('No error found');
  });

});
