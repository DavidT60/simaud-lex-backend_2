import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Notifications")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("notification")
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Get()
  getUserNotifications(@Request() req) {
    return this.service.getUserNotifications(req.user.id);
  }

  @Get("unread-count")
  getUnreadCount(@Request() req) {
    console.log("Request NOtification");
    return this.service.getUnreadCount(req.user.id);
  }

  @Patch(":id/read")
  markAsRead(@Param("id") id: string, @Request() req) {
    return this.service.markAsRead(id, req.user.id);
  }

  @Patch("read-all")
  markAllAsRead(@Request() req) {
    return this.service.markAllAsRead(req.user.id);
  }
}
