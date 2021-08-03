import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it ('/file-manager/ (PUT) Send file', async () => {
    const ret = await request(app.getHttpServer()).put('/file-manager/').attach('file', Buffer.from('Jestem sobie pliczek'), 'test.txt');

    expect(ret.body.name).toEqual('test.txt');
    expect(ret.body.size).toEqual(20);

    expect(ret.body).toEqual({
      id: 1,
      name: 'test.txt',
      extension: '.txt',
      size: 20,
      mimetype: 'text/plain',
      createdAt: ret.body.createdAt,
    });
  });

  it ('/get pliku', () => {

  });




});
