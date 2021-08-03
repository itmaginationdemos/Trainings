import {SetMetadata} from "@nestjs/common";
import {FieldRequestPosition, Position} from "./interfaces/field-request-position.interface";

export const FilePasswordPosition = (field: string, position: Position) => SetMetadata('filePasswordPosition', {field, position} as FieldRequestPosition);
