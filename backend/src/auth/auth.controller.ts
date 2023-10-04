import { Controller, Body, Post, UseGuards, Request, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, UserDto } from '../users/dto/user.dto';
import { DoesUserExist } from 'src/core/guards/doesUserExist.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommonService } from 'src/common/common.service';


@Controller('')
@ApiTags("user")
export class AuthController {
    constructor(private authService: AuthService, private commonService: CommonService) { }

    /**
     * signup a user
     * @param user name ,email or password
     * @returns signup true if successful otherwise false
     */
    @UseGuards(DoesUserExist)
    @Post('api/users/signup')
    async signUp(@Body() req: UserDto) {
        return await this.authService.create(req);
    }


    /**
     * user login
     * @param req email address and password
     * @returns success or error if  successful return  userinfo and token
     */
    @Post('api/users/login')
    async login(@Body() req: LoginDto) {
        return await this.authService.login(req);
    }


    /**
     * user profile
     * @param req token 
     * @returns user profile
     * 
     */
    @ApiBearerAuth("Authorization")
    @UseGuards(AuthGuard('jwt'))
    @Get('api/user/me')
    getProfileByToken(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }

    /**
     * @param req token 
     * @returns random jock
     */
    @ApiBearerAuth("Authorization")
    @UseGuards(AuthGuard('jwt'))
    @Get('random/jock')
    jokeApi() {
        return this.commonService.getRandomJoke()
    }
}
