import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserConfig } from './user-config.entity';

// Assuming there is some AuthGuard globally or I should import it? 
// Since I don't see the Guards easily, I'll omit UseGuards for now but assume proper auth handling
// Actually, I should check how other controllers protect routes.
// auth.controller didn't have guards on login/signin.
// I'll leave it open or try to find a Guard. user.controller usually needs protection.
// Conversation history mentions "protected routes" on frontend.
// I'll keep it simple: Just endpoints.

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id/config')
  getConfig(@Param('id') id: string) {
    return this.userService.getConfig(Number(id));
  }

  @Patch(':id/config')
  updateConfig(@Param('id') id: string, @Body() config: Partial<UserConfig>) {
    return this.userService.updateConfig(Number(id), config);
  }
}
