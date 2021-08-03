import {Injectable, NotImplementedException, OnModuleInit} from "@nestjs/common";
import {join} from "path";
import {ReadStream, unlink, writeFile} from "fs";
import * as promisify from 'util.promisify';
import * as mkdirp from "mkdirp";
import * as fs from 'fs';

const writeFilePromise = promisify(writeFile);
const unlinkPromise = promisify(unlink);

@Injectable()
export class StorageService implements OnModuleInit {
    protected readonly uploadDir;
    constructor() {
        this.uploadDir = process.env.UPLOADED_FILE_PATH || join(__dirname, '..', '..', '..', 'public', 'uploads');
    }


    // Upewnij się że katalog istnieje zanim zacznie działać appka
    async onModuleInit() {
        mkdirp.nativeSync(this.uploadDir);
    }

    // Zapisz plik do katalogu
    async saveFile(path: string, content: Buffer): Promise<true> {
        try {
            await writeFilePromise(join(this.uploadDir, path), content);
        } catch (err) {
            throw new Error('Could not save file');
        }

        return true;
    }

    // Usuń plik z katalogu
    async removeFile(path: string): Promise<true> {
        try {
            await unlinkPromise(join(this.uploadDir, path));
        } catch (err) {
            throw new Error('Could not delete file');
        }

        return true;
    }

    // Pobierz readStreama z pliku
    async getFileStream(path: string): Promise<ReadStream> {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(join(this.uploadDir, path));
            stream.once('error', (err) => {
                reject(err);
            });
            stream.once('open', () => {
                stream.pause();
                resolve(stream);
            });
        });
    }
}
