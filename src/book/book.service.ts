import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookDto } from './dto/book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from "typeorm";
import { BookEntity } from './entities/book.entity';
import { Status } from '../enum/book-enum';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    private bookEntityRepository: Repository<BookEntity>,
  ) {}

  async create(bookDto: BookDto): Promise<BookEntity> {
    bookDto.createdBy = 'Admin';
    bookDto.updatedBy = 'Admin';
    const book = this.bookEntityRepository.create(bookDto);
    return await this.bookEntityRepository.save(book);
  }

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

  async findOne(id: string): Promise<BookEntity> {
    const book = await this.bookEntityRepository.findOne({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async update(id: string, bookDto: BookDto): Promise<BookEntity> {
    const book = await this.bookEntityRepository.findOne({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }
    Object.assign(book, bookDto, {
      status: bookDto.status || book.status, // Ensure status is set if not provided
    });
    return await this.bookEntityRepository.save(book);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.bookEntityRepository.delete(id);

    return result.affected > 0;
  }
}
