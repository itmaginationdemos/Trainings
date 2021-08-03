import {ConflictException, Injectable, NotAcceptableException, NotFoundException} from "@nestjs/common";
import {FileDbService} from "../../db/services/file-db.service";
import {FileDto} from "../models/file.dto";
import {StorageService} from "../../shared/storage/storage.service";
import {ChangePasswordDto} from "../models/change-password.dto";

export interface FileCreationData {
    originalname: string;
    mimetype: string;
    size: number;
    ourname: string;
    ext: string;
}

@Injectable()
export class FileManagerService {
    constructor(
        private readonly dbService: FileDbService,
        private readonly storageService: StorageService,
    ) { }

    async getList(): Promise<FileDto[]> {
        return (await this.dbService.getList()).map(f => new FileDto(f));
    }
    async getById(id: number): Promise<FileDto> {
        const entity = await this.dbService.getById(id);

        return new FileDto(entity);
    }

    // async changePassword(id: number, newPass: string, oldPass?: string) {
    //     return this.changePassword(id, {pass: newPass, oldPass})
    // }
    async changePassword(id: number, dto: ChangePasswordDto) {
        // pobrać rekord z bazy
        const entity = await this.dbService.getById(id);

        // sprawdzić czy jest hasło
        if (entity.pass && entity.pass !== dto.oldPass) {
            // // jak jest to nic
            throw new ConflictException();
        }

        entity.pass = dto.pass;
        await entity.save(); // update na rekord

        return new FileDto(entity);
    }

    async delete(id: number) {
        const entity = await this.dbService.getById(id);

        try {
            await this.storageService.removeFile(entity.path);
        } catch (err) {
            throw new NotAcceptableException();
        }

        try {
            return this.dbService.delete(entity);
        } catch (err) {
            throw new ConflictException();
        }
    }

    async create(file: FileCreationData): Promise<FileDto> {
        const entity = await this.dbService.create({
            name: file.originalname, path: file.ourname, size: file.size, mimetype: file.mimetype, ext: file.ext
        });
        await entity.save();

        return new FileDto(await entity.reload()); // sprawdzić czy trzeba await entity.reload()  czy wystarczy samo  entity;
    }

    async getFileDataForStream(id: number) {
        const entity = await this.dbService.getById(id);

        return {path: entity.path, mimetype: entity.mimetype};
    }

    async getFileStream(id: number) {
        const entity = await this.dbService.getById(id);

        const stream = await this.storageService.getFileStream(entity.path);
        const mimetype = entity.mimetype;

        return {stream, mimetype};
    }
}
