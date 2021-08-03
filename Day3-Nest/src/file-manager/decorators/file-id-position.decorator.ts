import {SetMetadata} from "@nestjs/common";
import {FieldRequestPosition, Position} from "./interfaces/field-request-position.interface";

export const FileIdPosition = (field: string, position: Position) => SetMetadata('fileIdPosition', {field, position} as FieldRequestPosition);
