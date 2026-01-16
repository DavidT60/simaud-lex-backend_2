import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification, NotificationType } from "./notification.entity";
import { User } from "../user/user.entity";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>
  ) {}

  async create(
    user: User,
    message: string,
    type: NotificationType,
    relatedEntityId?: string
  ) {
    const notification = this.repo.create({
      user,
      message,
      type,
      relatedEntityId,
    });
    return this.repo.save(notification);
  }

  async getUserNotifications(userId: number, onlyUnread = false) {
    const where: any = { user: { id: userId } };
    if (onlyUnread) {
      where.isRead = false;
    }

    return this.repo.find({
      where,
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async getUnreadCount(userId: number) {
    return this.repo.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: string, userId: number) {
    const notification = await this.repo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (notification) {
      notification.isRead = true;
      return this.repo.save(notification);
    }

    return null;
  }

  async markAllAsRead(userId: number) {
    await this.repo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true }
    );
    return { success: true };
  }
}
