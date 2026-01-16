import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-code')
  sendCode(@Body() body: { email: string }) {
    return this.authService.sendVerificationCode(body.email);
  }

  @Post('singin')
  singin(@Body() body: { email: string; password: string; name: string; code: string }) {
    console.log('CALLING SING IN CONTROLLER AUTH');
    return this.authService.singin(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    console.log('CALLING LOGIN IN CONTROLLER AUTH');
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.sendPasswordResetCode(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body);
  }
}
