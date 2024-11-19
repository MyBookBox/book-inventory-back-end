import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UserSigninDto } from './dto/user-signin.dto';
import { CurrentUser } from '../utility/decorators/current-user-decorator';
import { AuthenticationGuard } from '../utility/guards/authentication-guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() userSignupDto: UserSignupDto): Promise<UserEntity> {
    return await this.userService.signup(userSignupDto);
  }

  @Post('signin')
  async signin(
    @Body() userSigninDto: UserSigninDto,
  ): Promise<{ user: UserEntity; accessToken: string }> {
    const user = await this.userService.signin(userSigninDto);
    const accessToken = await this.userService.accessToken(user);
    return { accessToken, user };
  }

  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserEntity> {
    return await this.userService.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.userService.remove(+id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('me')
  getProfile(@CurrentUser() currentUser: UserEntity) {
    console.log(currentUser);
    return currentUser;
  }
}
