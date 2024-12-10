import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoleTypes, Status } from '../../enum/user-enum';

export class UserEditDto {
  @IsNotEmpty({ message: 'Name is Required' })
  @IsString({ message: 'Name must be a String' })
  name: string;

  @IsNotEmpty({ message: 'Email is Required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @IsArray({ message: 'Role must be an Array of Strings' })
  @IsOptional()
  role: RoleTypes[];

  @IsEnum(Status, { message: 'Status is invalid' })
  @IsOptional()
  status: Status;

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}
