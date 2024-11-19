import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Status } from '../../enum/book-enum';
import { Type } from 'class-transformer';

export class BookDto {
  @IsString()
  @IsNotEmpty({ message: 'Book title is Required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Book author is Required' })
  author: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'book published date is Required' })
  publish_date: Date;

  @IsNumber()
  @IsNotEmpty({ message: 'Book price is Required' })
  price: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Book quantity is Required' })
  quantity: number;

  @IsEnum(Status)
  @IsNotEmpty({ message: 'Book status is Required' })
  status: Status;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}
