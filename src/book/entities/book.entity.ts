import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '../../enum/book-enum';

@Entity('Books')
export class BookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  genre: string;

  @Column('text')
  description: string;

  @Column('date')
  publish_date: Date;

  @Column('decimal')
  price: number;

  @Column('int')
  quantity: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.IN_STOKE,
  })
  status: Status;

  @Column({
    type: 'bigint',
    default: () => 'extract(epoch from now())::bigint',
    onUpdate: 'extract(epoch from now())::bigint',
  })
  createdAt: number;

  @Column({
    type: 'bigint',
    default: () => 'extract(epoch from now())::bigint',
    onUpdate: 'extract(epoch from now())::bigint',
  })
  updatedAt: number;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;
}
