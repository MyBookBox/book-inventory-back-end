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
import { UserChangePasswordDto } from "./dto/user-change-password.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async signup(@Body() userSignupDto: UserSignupDto): Promise<UserEntity> {
    return await this.userService.signup(userSignupDto);
  }

  @Post('signin')
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async signin(
    @Body() userSigninDto: UserSigninDto,
  ): Promise<{ user: UserEntity; accessToken: string }> {
    const user = await this.userService.signin(userSigninDto);
    const accessToken = await this.userService.accessToken(user);
    return { accessToken, user };
  }

  @Post('change-password')
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  async changePassword(
    @Body() userChangePasswordDto: UserChangePasswordDto,
  ): Promise<{ user: UserEntity }> {
    const user = await this.userService.changePassword(userChangePasswordDto);
    return { user };
  }

  @Get()
  @Roles(RoleTypes.ADMIN)
  @UseGuards(RolesGuard)
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN, RoleTypes.USER)
  async update(
    @Param('id') id: number,
    @Body() userEditDto: UserEditDto,
  ): Promise<UserEntity> {
    return await this.userService.update(id, userEditDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.ADMIN)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.userService.remove(+id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  getProfile(@CurrentUser() currentUser: UserEntity) {
    console.log(currentUser);
    return currentUser;
  }
}
