import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  Length,
  IsArray,
  IsEnum,
} from 'class-validator';
import { RoleTypes, Status } from '../../enum/user-enum';

export class UserSignupDto {
  @IsNotEmpty({ message: 'Name is Required' })
  @IsString({ message: 'Name must be a String' })
  name: string;

  @IsNotEmpty({ message: 'Email is Required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @IsNotEmpty({ message: 'Password is Required' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  password: string;

  @IsNotEmpty({ message: 'Role is Required' })
  @IsArray({ message: 'Role must be an Array of Strings' })
  role: RoleTypes[];

  @IsEnum(Status, { message: 'Status is invalid' })
  @IsOptional()
  status: Status;

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}
