import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserConfig } from "./user-config.entity";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
// Assuming there is some AuthGuard globally or I should import it?
// Since I don't see the Guards easily, I'll omit UseGuards for now but assume proper auth handling
// Actually, I should check how other controllers protect routes.
// auth.controller didn't have guards on login/signin.
// I'll leave it open or try to find a Guard. user.controller usually needs protection.
// Conversation history mentions "protected routes" on frontend.
// I'll keep it simple: Just endpoints.

@ApiTags("Usuarios")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get(":id/config")
  getConfig(@Param("id") id: string) {
    return this.userService.getConfig(Number(id));
  }

  @Patch(":id/config")
  updateConfig(@Param("id") id: string, @Body() config: Partial<UserConfig>) {
    return this.userService.updateConfig(Number(id), config);
  }

  @Patch(":id/password")
  updatePassword(
    @Param("id") id: string,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.userService.updatePassword(
      Number(id),
      body.currentPassword,
      body.newPassword
    );
  }

  @Get()
  @ApiOperation({ summary: "Obtener Todos los Usuarios." })
  getAllUsers() {
    return this.userService.findAll();
  }

  @Patch(":id/role")
  updateRole(@Param("id") id: string, @Body("role") role: string) {
    return this.userService.updateRole(Number(id), role);
  }

  @Get("search/students")
  searchStudents(@Query("email") email: string) {
    return this.userService.searchStudents(email);
  }
}
