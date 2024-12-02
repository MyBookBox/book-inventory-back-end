import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { BookDto } from './dto/book.dto';
import { BookEntity } from './entities/book.entity';
import { Status } from '../enum/book-enum';
import { JwtAuthGuard } from '../utility/guards/authentication-guard';
import { Roles } from '../utility/decorators/role-decorator';
import { RoleTypes } from '../enum/user-enum';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async create(@Body() bookDto: BookDto): Promise<BookEntity> {
    return await this.bookService.create(bookDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async findAll(
    @Query('title') title?: string,
    @Query('author') author?: string,
    @Query('genre') genre?: string,
    @Query('status') status?: Status,
    @Query('publish_date') publish_date?: string,
  ): Promise<BookEntity[]> {
    return this.bookService.findAll(title, author, genre, status, publish_date);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async searchBook(@Query('query') query: string): Promise<BookEntity[]> {
    return this.bookService.searchBook(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async findOne(@Param('id') id: string): Promise<BookEntity> {
    return await this.bookService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() bookDto: BookDto,
  ): Promise<BookEntity> {
    return await this.bookService.update(id, bookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.bookService.remove(id);
  }
}
