import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RoleTypes, Status } from '../../enum/user-enum';

@Entity('Users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: RoleTypes,
    array: true,
    default: [RoleTypes.USER],
  })
  role: RoleTypes;

  @Column({
    type: 'enum',
    enum: Status,
    array: false,
    default: Status.ACTIVE,
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
