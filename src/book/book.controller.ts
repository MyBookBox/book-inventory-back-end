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

  /**
   * Creates a new book in the system.
   *
   * This endpoint is protected by the `JwtAuthGuard` and requires the user to have an `ADMIN` role.
   * The method delegates the creation process to the `bookService`.
   *
   * @param bookDto - An object containing the details of the book to be created.
   * @returns A promise that resolves to the newly created book entity.
   *
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async create(@Body() bookDto: BookDto): Promise<BookEntity> {
    return await this.bookService.create(bookDto);
  }

  /**
   * Retrieves a list of books filtered by optional query parameters.
   *
   * This endpoint is protected by the `JwtAuthGuard` and can be accessed by users with `USER` or `ADMIN` roles.
   * The method supports filtering by title, author, genre, status, and publish date.
   * If no filters are provided, all books are returned.
   *
   * @param title - (Optional) Filter by book title (partial match).
   * @param author - (Optional) Filter by author name (partial match).
   * @param genre - (Optional) Filter by book genre (partial match).
   * @param status - (Optional) Filter by the status of the book.
   * @param publish_date - (Optional) Filter by the publish date of the book (must be a valid date string).
   * @returns A promise that resolves to an array of book entities matching the filters.
   *
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role.
   */
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

  /**
   * Searches for books based on a query string.
   *
   * This endpoint is protected by the `JwtAuthGuard` and can be accessed by users with `USER` or `ADMIN` roles.
   * The query string is used to search across multiple fields, including title, author, genre, status, and publish date.
   * Partial matches are supported for string fields. If the query matches a valid status or date, it is used for filtering.
   *
   * @param query - The search term used to filter books. It can be a partial string, a valid status, or a date.
   * @returns A promise that resolves to an array of books matching the search criteria.
   *
   * @throws BadRequestException - If the query string is empty.
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role.
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async searchBook(@Query('query') query: string): Promise<BookEntity[]> {
    return this.bookService.searchBook(query);
  }

  /**
   * Retrieves a single book by its ID.
   *
   * This endpoint is protected by the `JwtAuthGuard` and can be accessed by users with `USER` or `ADMIN` roles.
   * It returns the book entity that matches the provided ID.
   *
   * @param id - The unique identifier of the book to retrieve.
   * @returns A promise that resolves to the book entity if found.
   *
   * @throws NotFoundException - If no book is found with the given ID.
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async findOne(@Param('id') id: string): Promise<BookEntity> {
    return await this.bookService.findOne(id);
  }

  /**
   * Updates an existing book by its ID with the provided data.
   *
   * This endpoint is protected by the `JwtAuthGuard` and requires the user to have the `ADMIN` role.
   * It updates the book entity that matches the provided ID with the fields specified in the `bookDto`.
   *
   * @param id - The unique identifier of the book to update.
   * @param bookDto - An object containing the updated details of the book.
   * @returns A promise that resolves to the updated book entity.
   *
   * @throws NotFoundException - If no book is found with the given ID.
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() bookDto: BookDto,
  ): Promise<BookEntity> {
    return await this.bookService.update(id, bookDto);
  }

  /**
   * Deletes a book by its ID.
   *
   * This endpoint is protected by the `JwtAuthGuard` and requires the user to have the `ADMIN` role.
   * It attempts to delete the book entity that matches the provided ID.
   *
   * @param id - The unique identifier of the book to delete.
   * @returns A promise that resolves to `true` if the book was successfully deleted, otherwise `false`.
   *
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.bookService.remove(id);
  }
}
