import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @MinLength(1)
  @MaxLength(50)
  pass: string;

  @ApiProperty({
    required: false,
    maxLength: 50,
    minLength: 1,
    description: 'Old password if you need to change password into new one',
  })
  @MinLength(1)
  @MaxLength(50)
  @IsOptional()
  oldPass?: string;
}
