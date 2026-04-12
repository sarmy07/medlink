import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly recordRepo: Repository<MedicalRecord>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly appointmentService: AppointmentsService,
    private readonly notificationService: NotificationsService,
  ) {}

  async create(doctorId: string, dto: CreateMedicalRecordDto) {
    const patient = await this.userRepo.findOne({
      where: {
        id: dto.patientId,
        role: UserRole.PATIENT,
      },
    });
    if (!patient) return null;

    const doctor = await this.userRepo.findOne({
      where: {
        id: doctorId,
      },
    });
    if (!doctor) return null;

    let appointment: Appointment | null = null;

    if (dto.appointmentId) {
      appointment = await this.appointmentService.findOne(
        dto.appointmentId,
        doctor,
      );
      if (!appointment) return null;
    }

    const record = this.recordRepo.create({
      patient,
      doctor,
      appointment,
      diagnosis: dto.diagnosis,
      symptoms: dto.symptoms,
      notes: dto.notes,
      treatment: dto.treatment,
      isFollowUpRequired: dto.isFollowUpRequired ?? false,
      followUpdate: dto.followUpdate ? new Date(dto.followUpdate) : null,
    });

    const saved = await this.recordRepo.save(record);

    await this.notificationService.create(
      patient,
      NotificationType.MEDICAL_RECORD_CREATED,
      'Medical Record Added',
      `Dr ${doctor.firstname} ${doctor.lastname} has added a medical record for you`,
      saved.id,
    );
    return saved;
  }

  async findMyRecords(user: User) {
    const where =
      user.role === UserRole.DOCTOR
        ? { doctor: { id: user.id } }
        : { patient: { id: user.id } };

    return this.recordRepo.find({
      where,
      relations: {
        patient: true,
        doctor: true,
        appointment: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findPatientReords(patientId: string, doctorId: string) {
    const patient = await this.userRepo.findOne({
      where: {
        id: patientId,
        role: UserRole.PATIENT,
      },
    });
    if (!patient) return null;

    return this.recordRepo.find({
      where: {
        patient: { id: patientId },
        doctor: { id: doctorId },
      },
      relations: ['patient', 'doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return `This action returns all medicalRecords`;
  }

  async findOne(id: string, user: User) {
    const record = await this.recordRepo.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'appointment'],
    });

    if (!record) return null;

    const isOwner =
      record.doctor.id === user.id || record.patient.id === user.id;
    if (!isOwner) throw new ForbiddenException('access denied');
    return record;
  }

  async update(id: string, doctorId: string, dto: UpdateMedicalRecordDto) {
    const record = await this.recordRepo.findOne({
      where: {
        id,
        doctor: { id: doctorId },
      },
    });
    if (!record) return null;

    if (record.doctor.id !== doctorId) {
      throw new ForbiddenException(
        'only the doctor who created this record can update it',
      );
    }

    Object.assign(record, {
      ...dto,
      followUpdate: dto.followUpdate
        ? new Date(dto.followUpdate)
        : record.followUpdate,
    });

    return await this.recordRepo.save(record);
  }

  // medical records shouldnt be deleted.
  async remove(id: string, doctorId: string) {
    const record = await this.recordRepo.findOne({
      where: {
        id,
        doctor: { id: doctorId },
      },
    });
    if (!record) return null;

    if (record.doctor.id !== doctorId) {
      throw new ForbiddenException(
        'only the doctor who created this record can delete it',
      );
    }

    await this.recordRepo.remove(record);
    return {
      message: 'Medical record deleted!',
    };
  }
}
