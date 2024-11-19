import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { BookDto } from './dto/book.dto';
import { BookEntity } from './entities/book.entity';
import { Status } from '../enum/book-enum';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async create(@Body() bookDto: BookDto): Promise<BookEntity> {
    return await this.bookService.create(bookDto);
  }

  @Get()
  async findAll(
    @Query('title') title?: string,
    @Query('author') author?: string,
    @Query('genre') genre?: string,
    @Query('status') status?: Status,
    @Query('publish_date') publish_date?: string,
  ): Promise<BookEntity[]> {
    return this.bookService.findAll(title, author, genre, status, publish_date);
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookEntity> {
    return await this.bookService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() bookDto: BookDto,
  ): Promise<BookEntity> {
    return await this.bookService.update(id, bookDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.bookService.remove(id);
  }
}
