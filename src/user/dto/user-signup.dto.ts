import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  Length,
} from 'class-validator';

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

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}
