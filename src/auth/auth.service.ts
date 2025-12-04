import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { hashPassword, comparePassword } from '../common/until/bycryp.pss';
import { CustomError } from '../common/exceptions/custom-exceptions.filter';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
  ) {}

  async singin(credentials: { email: string; password: string; name: string }) {
    let _credentials = credentials;
    _credentials['password'] = await hashPassword(_credentials['password']);

    const create = await this.userService.singin(_credentials);

    return {
      access_token: this.jwt.sign({
        sub: create.id,
        email: create.email,
      }),
    };
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.userService.findOneEmail(credentials.email);
    if (!user) {
      throw new CustomError(
        'Password is incorrect',
        'PASSWORD_MISMATCH',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let _comparing = await comparePassword(credentials.password, user.password);

    if (!_comparing) {
      throw new CustomError(
        'Password is incorrect',
        'PASSWORD_MISMATCH',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      access_token: this.jwt.sign({
        sub: user.id,
        email: user.email,
      }),
    };
  }
}
