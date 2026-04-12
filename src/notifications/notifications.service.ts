/*
https://docs.nestjs.com/providers#services
*/

import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationDto } from './dto/create.notification.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(
    recipient: User,
    type: NotificationType,
    title: string,
    message: string,
    referenceId?: string,
  ) {
    const notification = this.notificationRepo.create({
      recipient,
      type,
      title,
      message,
      referenceId,
    });
    return await this.notificationRepo.save(notification);
  }

  async findNotifications(userId: string) {
    return this.notificationRepo.find({
      where: {
        recipient: { id: userId },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markedAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id,
        recipient: { id: userId },
      },
    });
    if (!notification) return null;

    if (notification.recipient.id !== userId) {
      throw new ForbiddenException('access denied');
    }

    notification.isRead = true;

    return await this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true },
    );

    return { message: 'All notifications marked as read' };
  }

  async getUnReadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { recipient: { id: userId }, isRead: false },
    });

    return { count };
  }

  async remove(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id,
        recipient: { id: userId },
      },
    });
    if (!notification) return null;

    await this.notificationRepo.remove(notification);

    return { message: 'Notification deleted' };
  }
}
