import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UserSigninDto } from './dto/user-signin.dto';
import { CurrentUser } from '../utility/decorators/current-user-decorator';
import { JwtAuthGuard } from '../utility/guards/authentication-guard';
import { RolesGuard } from '../utility/guards/roles-guard';
import { Roles } from '../utility/decorators/role-decorator';
import { RoleTypes } from '../enum/user-enum';
import { UserEditDto } from './dto/user-edit.dto';
import { UserChangePasswordDto } from './dto/user-change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Registers a new user in the system.
   *
   * This endpoint allows users with the `USER` or `ADMIN` roles to create a new account by providing the required details in `userSignupDto`.
   * It delegates the user creation to the `userService.signup` method.
   *
   * @param userSignupDto - An object containing the user's signup information, such as email, password, and other details.
   * @returns A promise that resolves to the newly created user entity.
   *
   * @throws UnauthorizedException - If the user does not have the required role (`USER` or `ADMIN`).
   */
  @Post('signup')
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async signup(@Body() userSignupDto: UserSignupDto): Promise<UserEntity> {
    return await this.userService.signup(userSignupDto);
  }

  /**
   * Authenticates a user during sign-in and generates an access token.
   *
   * This endpoint allows users with the `USER` or `ADMIN` roles to sign in by providing their credentials in `userSigninDto`.
   * It delegates the sign-in process to the `userService.signin` method, and if successful, generates an access token using `userService.accessToken`.
   *
   * @param userSigninDto - An object containing the user's sign-in credentials, such as email and password.
   * @returns A promise that resolves to an object containing the authenticated user and the generated access token.
   *
   * @throws UnauthorizedException - If the user does not have the required role (`USER` or `ADMIN`).
   * @throws BadRequestException - If the credentials are invalid or the user account is deactivated.
   */
  @Post('signin')
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async signin(
    @Body() userSigninDto: UserSigninDto,
  ): Promise<{ user: UserEntity; accessToken: string }> {
    const user = await this.userService.signin(userSigninDto);
    const accessToken = await this.userService.accessToken(user);
    return { accessToken, user };
  }

  /**
   * Changes the user's password.
   *
   * This endpoint allows users with the `USER` or `ADMIN` roles to change their password by providing the necessary details in `userChangePasswordDto`.
   * It delegates the password change process to the `userService.changePassword` method, and returns the updated user entity.
   *
   * @param userChangePasswordDto - An object containing the user's email, current password, and new password.
   * @returns A promise that resolves to an object containing the updated user entity.
   *
   * @throws UnauthorizedException - If the user does not have the required role (`USER` or `ADMIN`).
   * @throws BadRequestException - If the current password is invalid or other validation fails.
   */
  @Post('change-password')
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async changePassword(
    @Body() userChangePasswordDto: UserChangePasswordDto,
  ): Promise<{ user: UserEntity }> {
    const user = await this.userService.changePassword(userChangePasswordDto);
    return { user };
  }

  /**
   * Retrieves all users from the system.
   *
   * This endpoint is protected by the `RolesGuard` and requires the user to have the `ADMIN` role.
   * It delegates the retrieval of all user entities to the `userService.findAll` method.
   *
   * @returns A promise that resolves to an array of all user entities.
   *
   * @throws UnauthorizedException - If the user does not have the required role (`ADMIN`).
   */
  @Get()
  @Roles(RoleTypes.ADMIN)
  @UseGuards(RolesGuard)
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

  /**
   * Retrieves a user by their ID.
   *
   * This endpoint is protected by the `JwtAuthGuard` and can be accessed by users with `USER` or `ADMIN` roles.
   * It checks the user ID from the request (extracted from the JWT token in middleware) and ensures it's available.
   * If the user ID is not found in the request, an `UnauthorizedException` is thrown.
   * It delegates the retrieval of the user to the `userService.findOne` method.
   *
   * @param id - The unique identifier of the user to retrieve (although this is not used in the method, the user ID from the token is used).
   * @param req - The request object containing the user ID extracted from the JWT token.
   * @returns A promise that resolves to the user entity.
   *
   * @throws UnauthorizedException - If the user ID is not found in the request.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  findOne(@Param('id') id: number, @Req() req: Request) {
    const userIdFromMiddleware = req['user']?.id;
    if (!userIdFromMiddleware) {
      throw new UnauthorizedException('User ID not found in request');
    }
    return this.userService.findOne(userIdFromMiddleware);
  }

  /**
   * Updates an existing user's details.
   *
   * This endpoint is protected by the `JwtAuthGuard` and can be accessed by users with `ADMIN` or `USER` roles.
   * It allows updating the user entity based on the provided `userEditDto`.
   * If the user has the appropriate role (`ADMIN` or `USER`), the user entity will be updated accordingly.
   *
   * @param id - The unique identifier of the user to update.
   * @param userEditDto - An object containing the fields to update in the user entity.
   * @returns A promise that resolves to the updated user entity.
   *
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role.
   * @throws NotFoundException - If no user is found with the provided ID.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN, RoleTypes.USER)
  async update(
    @Param('id') id: number,
    @Body() userEditDto: UserEditDto,
  ): Promise<UserEntity> {
    return await this.userService.update(id, userEditDto);
  }

  /**
   * Deletes a user by their ID.
   *
   * This endpoint is protected by the `JwtAuthGuard` and requires the user to have the `ADMIN` role.
   * It attempts to delete the user entity that matches the provided ID.
   *
   * @param id - The unique identifier of the user to delete.
   * @returns A promise that resolves to `true` if the user was successfully deleted, otherwise `false`.
   *
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role (`ADMIN`).
   * @throws NotFoundException - If no user is found with the given ID.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.userService.remove(+id);
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * This endpoint is protected by the `JwtAuthGuard` and can be accessed by users with `USER` or `ADMIN` roles.
   * It returns the authenticated user's profile, which is extracted from the request (via `CurrentUser` decorator).
   *
   * @param currentUser - The currently authenticated user entity, injected via a custom decorator.
   * @returns The profile of the currently authenticated user.
   *
   * @throws UnauthorizedException - If the user is not authenticated or does not have the required role (`USER` or `ADMIN`).
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  getProfile(@CurrentUser() currentUser: UserEntity) {
    console.log(currentUser);
    return currentUser;
  }
}
