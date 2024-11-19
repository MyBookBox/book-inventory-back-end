import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class UserSigninDto {
  @IsNotEmpty({ message: 'Email is Required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @IsNotEmpty({ message: 'Password is Required' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  password: string;
}
