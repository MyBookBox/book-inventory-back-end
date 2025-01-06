import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookDto } from './dto/book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BookEntity } from './entities/book.entity';
import { Status } from '../enum/book-enum';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    private bookEntityRepository: Repository<BookEntity>,
  ) {}

  /**
   * Creates a new book entry in the database.
   * @param {BookDto} bookDto - The data transfer object containing book details.
   * @returns {Promise<BookEntity>} - A promise that resolves to the created book entity.
   * @throws {Error} - If the book creation fails.
   */
  async create(bookDto: BookDto): Promise<BookEntity> {
    bookDto.createdBy = 'Admin';
    bookDto.updatedBy = 'Admin';
    const book = this.bookEntityRepository.create(bookDto);
    return await this.bookEntityRepository.save(book);
  }

  /**
   * Retrieves a list of books from the database based on the provided filters.
   * @param {string} [title] - (Optional) Filter books by title. Supports partial matches.
   * @param {string} [author] - (Optional) Filter books by author. Supports partial matches.
   * @param {string} [genre] - (Optional) Filter books by genre. Supports partial matches.
   * @param {Status} [status] - (Optional) Filter books by their status.
   * @param {string} [publish_date] - (Optional) Filter books by their publish date (YYYY-MM-DD).
   * @returns {Promise<BookEntity[]>} - A promise that resolves to an array of matching book entities.
   * @throws {NotFoundException} - If no books matching the criteria are found.
   */
  async findAll(
    title?: string,
    author?: string,
    genre?: string,
    status?: Status,
    publish_date?: string,
  ): Promise<BookEntity[]> {
    const query = this.bookEntityRepository.createQueryBuilder('book');
    if (title) {
      query.andWhere('book.title LIKE :title', { title: `%${title}%` });
    }
    if (author) {
      query.andWhere('book.author LIKE :author', { author: `%${author}%` });
    }
    if (genre) {
      query.andWhere('book.genre LIKE :genre', { genre: `%${genre}%` });
    }
    if (status) {
      query.andWhere('book.status = :status', { status });
    }
    if (publish_date) {
      query.andWhere('book.publish_date = :publish_date', { publish_date });
    }
    const books = await query.getMany();

    if (!books.length) {
      throw new NotFoundException('No books found');
    }

    return books;
  }

  /**
   * Searches for books in the repository based on a given query.
   *
   * This method supports searching by title, author, genre, status, or publish date.
   * If the query matches a valid date, it will be used to filter by the `publish_date` field.
   * If the query matches a valid status, it will be used to filter by the `status` field.
   * Partial matches are supported for title, author, and genre fields.
   *
   * @param query - The search term to filter books by. It can be a partial string, a valid status, or a date.
   * @returns A promise that resolves to an array of books matching the search criteria.
   * @throws BadRequestException - If the query is empty.
   */
  async searchBook(query: string): Promise<BookEntity[]> {
    if (!query) {
      throw new BadRequestException('Search query cannot be empty');
    }
    const parsedDate = !isNaN(Date.parse(query)) ? new Date(query) : null;
    return this.bookEntityRepository.find({
      where: [
        { title: ILike(`%${query}%`) },
        { author: ILike(`%${query}%`) },
        { genre: ILike(`%${query}%`) },
        {
          status: Object.values(Status).includes(query as Status)
            ? (query as Status)
            : undefined,
        },
        { publish_date: parsedDate || undefined },
      ].filter(Boolean),
    });
  }

  /**
   * Retrieves a single book by its ID.
   *
   * This method queries the repository to find a book that matches the given ID.
   * If no book is found, a `NotFoundException` is thrown.
   *
   * @param id - The unique identifier of the book to retrieve.
   * @returns A promise that resolves to the book entity if found.
   * @throws NotFoundException - If no book is found with the given ID.
   */
  async findOne(id: string): Promise<BookEntity> {
    const book = await this.bookEntityRepository.findOne({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  /**
   * Updates an existing book with the provided data.
   *
   * This method retrieves a book by its ID and updates it with the fields provided in the `bookDto`.
   * If the book is not found, a `NotFoundException` is thrown.
   * If the `status` field is not provided in `bookDto`, the current status of the book is retained.
   *
   * @param id - The unique identifier of the book to update.
   * @param bookDto - An object containing the fields to update in the book entity.
   * @returns A promise that resolves to the updated book entity.
   * @throws NotFoundException - If no book is found with the given ID.
   */
  async update(id: string, bookDto: BookDto): Promise<BookEntity> {
    const book = await this.bookEntityRepository.findOne({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }
    Object.assign(book, bookDto, {
      status: bookDto.status || book.status,
    });
    return await this.bookEntityRepository.save(book);
  }

  /**
   * Deletes a book by its ID.
   *
   * This method attempts to delete a book from the repository using the given ID.
   * It returns a boolean indicating whether the deletion was successful.
   *
   * @param id - The unique identifier of the book to delete.
   * @returns A promise that resolves to `true` if the book was successfully deleted, otherwise `false`.
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.bookEntityRepository.delete(id);

    return result.affected > 0;
  }
}
