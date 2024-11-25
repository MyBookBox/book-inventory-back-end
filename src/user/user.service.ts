import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSignupDto } from './dto/user-signup.dto';
import { compare, hash } from 'bcrypt';
import { UserSigninDto } from './dto/user-signin.dto';
import * as dotenv from 'dotenv';
import { sign } from 'jsonwebtoken';

// Load environment variables from .env file
dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async signup(userSignupDto: UserSignupDto): Promise<UserEntity> {
    const userExist = await this.findUserByEmail(userSignupDto.email);
    if (userExist)
      throw new BadRequestException('This email is already created');

    userSignupDto.createdBy = 'Admin';
    userSignupDto.updatedBy = 'Admin';
    userSignupDto.password = await hash(userSignupDto.password, 10);

    const user = this.usersRepository.create(userSignupDto);
    return await this.usersRepository.save(user);
  }

  async signin(userSigninDto: UserSigninDto): Promise<UserEntity> {
    const userExist = await this.findUserByEmail(userSigninDto.email);
    if (!userExist) throw new BadRequestException('User not found');

    const isPasswordValid = await compare(
      userSigninDto.password,
      userExist.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    return userExist;
  }

  async findUserByEmail(email: string): Promise<UserEntity | undefined> {
    return await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'status',
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
      ],
    });
  }

  async accessToken(user: UserEntity): Promise<string> {
    const secretKey =
      process.env.ACCESS_TOKEN_SECRET_KEY ||
      'likujyhtgrfedwsedrftgyhujikolplokijuhygtrfedwsedrftghyujikolpplokijuhy';
    if (!secretKey) {
      throw new Error(
        'ACCESS_TOKEN_SECRET_KEY is not defined in the environment variables',
      );
    }

    return sign(
      {
        id: user.id,
        email: user.email,
      },
      secretKey,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME || '1h' },
    );
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    if (!id || typeof id !== 'number' || isNaN(id)) {
      throw new Error(`${id} is an invalid user ID`);
    }

    return await this.usersRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<boolean> {
    const response = await this.usersRepository.delete({ id: id });
    return !!response;
  }
}
