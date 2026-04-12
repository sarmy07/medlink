/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from './dto/create.notification.dto';
import { CurrentUser } from 'src/auth/decorators/current.user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  findNotifications(@CurrentUser() user) {
    return this.notificationService.findNotifications(user.id);
  }

  @Get('unread/count')
  getUnreadCount(@CurrentUser() user) {
    return this.notificationService.getUnReadCount(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user) {
    return this.notificationService.markedAsRead(id, user.id);
  }

  @Patch('read/all')
  markAllAsRead(@CurrentUser() user) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.notificationService.remove(id, user.id);
  }
}
