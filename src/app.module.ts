import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import authConfig from './auth/config/auth.config';
import googleConfig from './auth/config/google.config';

@Module({
  imports: [
    CloudinaryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchema,
      load: [authConfig, googleConfig],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    AuthModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PrescriptionsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
