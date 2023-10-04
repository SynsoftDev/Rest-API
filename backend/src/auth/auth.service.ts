import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, UserDto } from 'src/users/dto/user.dto';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService, private readonly jwtService: JwtService,) { }

    async create(user: UserDto) {
        // hash the password
        const pass = await this.hashPassword(user.password);

        // create the user
        const newUser = await this.userService.create({ ...user, password: pass });

        // tslint:disable-next-line: no-string-literal
        const { password, ...result } = newUser['dataValues'];

        // return the user and the token
        return {
            statusCode: 201,
            message: 'signup successful',
            data: result,
        }
    }


    async login(body: LoginDto) {
        try {
            const { email, password } = body;
            // Find the user by email
            const user = await this.userService.findOneByEmail(email);
            let payload = {
                id: user.id,
                email: user.email
            }
            const token = await this.generateToken(payload);

            if (!user)
                throw new ForbiddenException('No user found');

            // Compare the provided password with the hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                return {
                    statusCode: 200,
                    message: 'login successful',
                    data: user,
                    token: token
                }
            } else {
                throw new ForbiddenException('Password mismatch');
            }
        } catch (error) {
            // Handle the error here
            console.error('Error occurred while destructuring user.body:', error);
            throw new HttpException(
                {
                    statusCode: 401,
                    message: error.message,
                    data: null,
                },
                HttpStatus.UNAUTHORIZED
            );
        }
    }


    async getProfile(id: number) {
        try {
            const user = await this.userService.findOneById(id);
            if (user) {
                return {
                    statusCode: 200,
                    message: 'find profile successfully',
                    data: user,
                }
            }
            else {
                throw new ForbiddenException('No user found');
            }

        } catch (error) {
            throw new HttpException(
                {
                    statusCode: 401,
                    message: error.message,
                    data: null,
                },
                HttpStatus.UNAUTHORIZED
            );
        }


    }

    async validateUser(username: string, pass: string) {
        // find if user exist with this email
        const user = await this.userService.findOneByEmail(username);
        if (!user) {
            return null;
        }

        // find if user password match
        const match = await this.comparePassword(pass, user.password);

        if (!match) {
            return null;
        }

        // tslint:disable-next-line: no-string-literal
        const { password, ...result } = user['dataValues'];
        return result;
    }

    public async generateToken(user) {
        const token = await this.jwtService.signAsync(user);
        return token;
    }

    private async hashPassword(password) {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    }

    private async comparePassword(enteredPassword, dbPassword) {
        const match = await bcrypt.compare(enteredPassword, dbPassword);
        return match;
    }
}
