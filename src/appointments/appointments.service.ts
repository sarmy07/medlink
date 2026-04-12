import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  Notification,
  NotificationType,
} from 'src/notifications/entities/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationsService,
  ) {}

  async create(patientId: string, dto: CreateAppointmentDto) {
    const doctor = await this.userRepo.findOne({
      where: {
        id: dto.doctorId,
        role: UserRole.DOCTOR,
      },
    });
    if (!doctor) return null;

    const patient = await this.userRepo.findOne({
      where: {
        id: patientId,
      },
    });
    if (!patient) return null;

    // check if theres a conflict appointment useing schedule and status
    const conflict = await this.appointmentRepo.findOne({
      where: {
        doctor: {
          id: doctor.id,
        },
        scheduledAt: new Date(dto.scheduledAt),
        status: AppointmentStatus.CONFIRMED,
      },
    });

    if (conflict)
      throw new BadRequestException('doctor is not available at this time');

    const appointment = this.appointmentRepo.create({
      patient,
      doctor,
      scheduledAt: new Date(dto.scheduledAt),
      reason: dto.reason,
    });

    const saved = await this.appointmentRepo.save(appointment);

    this.notificationService.create(
      doctor,
      NotificationType.APPOINTMENT_BOOKED,
      'New Appointment',
      `You have a new appointment with ${patient.firstname} ${patient.lastname} on ${saved.scheduledAt}`,
      saved.id,
    );

    return saved;
  }

  async findMyAppointments(user: User) {
    const where =
      user.role === UserRole.DOCTOR
        ? { doctor: { id: user.id } }
        : { patient: { id: user.id } };

    return this.appointmentRepo.find({
      where,
      relations: ['doctor', 'patient'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: string, user: User) {
    const appointment = await this.appointmentRepo.findOne({
      where: {
        id,
      },
      relations: ['doctor', 'patient'],
    });
    if (!appointment) return null;

    const isOwner =
      appointment.doctor.id === user.id || appointment.patient.id === user.id;

    if (!isOwner) throw new ForbiddenException('access denied');
    return appointment;
  }

  async update(id: string, user: User, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id, user);
    if (!appointment) return null;

    // only doctor can confirm or complete, only patient can cancel
    if (
      dto.status === AppointmentStatus.CONFIRMED ||
      dto.status === AppointmentStatus.COMPLETED
    ) {
      if (user.role !== UserRole.DOCTOR) {
        throw new ForbiddenException(
          'only doctors can confirm or complete appointment',
        );
      }
    }

    if (dto.status === AppointmentStatus.CANCELLED) {
      if (user.role !== UserRole.PATIENT) {
        throw new ForbiddenException('only patient can cancel appointment');
      }
    }

    Object.assign(appointment, dto);
    return await this.appointmentRepo.save(appointment);
  }

  async remove(id: string, user: User) {
    const appointment = await this.findOne(id, user);
    if (!appointment) return null;

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'only pending apointsments can be deleted!',
      );
    }
    await this.appointmentRepo.delete(appointment);
    return {
      message: 'Appointment deleted',
    };
  }
}
