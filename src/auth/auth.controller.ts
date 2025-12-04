import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('singin')
  singin(@Body() body: { email: string; password: string; name: string }) {
    console.log('CALLING SING IN CONTROLLER AUTH');
    return this.authService.singin(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    console.log('CALLING LOGIN IN CONTROLLER AUTH');
    return this.authService.login(body);
  }
}
