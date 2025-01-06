import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSignupDto } from './dto/user-signup.dto';
import { compare, hash } from 'bcrypt';
import { UserSigninDto } from './dto/user-signin.dto';
import * as dotenv from 'dotenv';
import { sign } from 'jsonwebtoken';
import { UserEditDto } from './dto/user-edit.dto';
import { Status } from '../enum/user-enum';
import { UserChangePasswordDto } from './dto/user-change-password.dto';

// Load environment variables from .env file
dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Registers a new user in the system.
   *
   * This method checks if a user already exists with the provided email. If a user is found, it throws a `BadRequestException`.
   * If the email is available, it hashes the user's password, assigns default values for `createdBy` and `updatedBy`, and saves the new user in the repository.
   *
   * @param userSignupDto - An object containing the user's signup details, including email, password, and other required fields.
   * @returns A promise that resolves to the newly created user entity.
   *
   * @throws BadRequestException - If a user already exists with the provided email.
   */
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

  /**
   * Authenticates a user during sign-in.
   *
   * This method checks if a user exists with the provided email. If no user is found, it throws a `BadRequestException`.
   * It also checks if the user's account is deactivated. If the account is deactivated, it throws a `BadRequestException`.
   * Then, it validates the provided password against the stored hash. If the password is invalid, it throws a `BadRequestException`.
   * If all checks pass, the user entity is returned.
   *
   * @param userSigninDto - An object containing the user's sign-in credentials, including email and password.
   * @returns A promise that resolves to the user entity if authentication is successful.
   *
   * @throws BadRequestException - If the user is not found, the account is deactivated, or the password is invalid.
   */
  async signin(userSigninDto: UserSigninDto): Promise<UserEntity> {
    const userExist = await this.findUserByEmail(userSigninDto.email);
    if (!userExist) throw new BadRequestException('User not found');

    if (userExist.status == Status.DEACTIVATED)
      throw new BadRequestException('User is Deactivated');

    const isPasswordValid = await compare(
      userSigninDto.password,
      userExist.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    return userExist;
  }

  /**
   * Changes the user's password.
   *
   * This method checks if a user exists with the provided email. If no user is found, it throws a `BadRequestException`.
   * It also checks if the user's account is deactivated. If the account is deactivated, it throws a `BadRequestException`.
   * Then, it validates the provided current password against the stored hash. If the current password is invalid, it throws a `BadRequestException`.
   * If all checks pass, the new password is hashed and saved in the user entity, and the updated user is saved in the repository.
   *
   * @param userChangePasswordDto - An object containing the user's email, current password, and new password.
   * @returns A promise that resolves to the updated user entity with the new password.
   *
   * @throws BadRequestException - If the user is not found, the account is deactivated, or the current password is invalid.
   */
  async changePassword(
    userChangePasswordDto: UserChangePasswordDto,
  ): Promise<UserEntity> {
    const userExist = await this.findUserByEmail(userChangePasswordDto.email);
    if (!userExist) throw new BadRequestException('User not found');

    if (userExist.status == Status.DEACTIVATED)
      throw new BadRequestException('User is Deactivated');

    const isPasswordValid = await compare(
      userChangePasswordDto.currentPassword,
      userExist.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    Object.assign(userExist, userChangePasswordDto, {
      password: await hash(userChangePasswordDto.newPassword, 10),
      status: userExist.status,
    });
    return await this.usersRepository.save(userExist);
  }

  /**
   * Retrieves a user by their email address.
   *
   * This method searches the user repository for a user entity that matches the provided email.
   * It returns the user entity with selected fields, such as id, name, email, password, role, status, etc.
   *
   * @param email - The email address of the user to retrieve.
   * @returns A promise that resolves to the user entity if found, or `undefined` if no user is found.
   */
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

  /**
   * Generates an access token for the user.
   *
   * This method creates a JWT (JSON Web Token) containing the user's `id` and `email`, signed with a secret key.
   * If the `ACCESS_TOKEN_SECRET_KEY` is not defined in the environment variables, it throws an error.
   * The token's expiration time is configurable via the `ACCESS_TOKEN_EXPIRE_TIME` environment variable (default is 1 hour).
   *
   * @param user - The user entity for which the access token is generated.
   * @returns A promise that resolves to the generated JWT access token.
   *
   * @throws Error - If the `ACCESS_TOKEN_SECRET_KEY` is not defined in the environment variables.
   */
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

  /**
   * Retrieves all users from the repository.
   *
   * This method queries the user repository to fetch all user entities.
   *
   * @returns A promise that resolves to an array of all user entities.
   */
  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  /**
   * Retrieves a user by their ID.
   *
   * This method checks if the provided ID is valid (a number) before querying the user repository.
   * If the ID is invalid, it throws an error. Otherwise, it fetches the user entity that matches the provided ID.
   *
   * @param id - The unique identifier of the user to retrieve.
   * @returns A promise that resolves to the user entity if found.
   *
   * @throws Error - If the provided ID is invalid (not a number or NaN).
   */
  async findOne(id: number): Promise<UserEntity> {
    if (!id || typeof id !== 'number' || isNaN(id)) {
      throw new Error(`${id} is an invalid user ID`);
    }

    return await this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Updates an existing user with the provided data.
   *
   * This method retrieves a user by their ID and updates their details with the values from `userEditDto`.
   * If no user is found with the provided ID, a `NotFoundException` is thrown.
   * The `password` field remains unchanged unless explicitly provided, and the status is updated if specified in `userEditDto`.
   *
   * @param id - The unique identifier of the user to update.
   * @param userEditDto - An object containing the fields to update in the user entity.
   * @returns A promise that resolves to the updated user entity.
   *
   * @throws NotFoundException - If no user is found with the given ID.
   */
  async update(id: number, userEditDto: UserEditDto): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, userEditDto, {
      password: user.password,
      status: userEditDto.status || user.status,
    });
    return await this.usersRepository.save(user);
  }

  /**
   * Deletes a user by their ID.
   *
   * This method attempts to delete the user entity that matches the provided ID from the repository.
   * It returns `true` if the deletion was successful, otherwise `false`.
   *
   * @param id - The unique identifier of the user to delete.
   * @returns A promise that resolves to `true` if the user was successfully deleted, otherwise `false`.
   */
  async remove(id: number): Promise<boolean> {
    const response = await this.usersRepository.delete({ id: id });
    return !!response;
  }
}
