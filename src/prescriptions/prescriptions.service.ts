import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { MedicalRecord } from 'src/medical-records/entities/medical-record.entity';
import {
  Notification,
  NotificationType,
} from 'src/notifications/entities/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly repo: Repository<Prescription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,

    private readonly notificationService: NotificationsService,
  ) {}
  async create(doctorId: string, dto: CreatePrescriptionDto) {
    const patient = await this.userRepo.findOne({
      where: {
        id: dto.patientId,
      },
    });
    if (!patient) return null;

    const doctor = await this.userRepo.findOne({
      where: {
        id: doctorId,
      },
    });
    if (!doctor) return null;

    let medicalRecord: MedicalRecord | null = null;
    if (dto.medicalRecordId) {
      medicalRecord = await this.medicalRecordRepo.findOne({
        where: {
          id: dto.medicalRecordId,
        },
      });
    }

    if (!medicalRecord) return null;

    const prescription = this.repo.create({
      doctor,
      patient,
      medicalRecord,
      medication: dto.medications,
      notes: dto.notes,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
    const saved = await this.repo.save(prescription);

    await this.notificationService.create(
      patient,
      NotificationType.PRESCRIPTION_ISSUED,
      'New Prescription',
      `Dr ${doctor.firstname} ${doctor.lastname} has issued you a new prescription`,
      saved.id,
    );
    return saved;
  }

  async findMyPrescription(user: User) {
    const where =
      user.role === UserRole.DOCTOR
        ? { doctor: { id: user.id } }
        : { patient: { id: user.id } };

    return await this.repo.find({
      where,
      relations: {
        doctor: true,
        patient: true,
        medicalRecord: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return `This action returns all prescriptions`;
  }

  async findOne(id: string, user: User) {
    const prescription = await this.repo.findOne({
      where: {
        id,
      },
      relations: {
        patient: true,
        doctor: true,
        medicalRecord: true,
      },
    });

    if (!prescription) return null;

    const isOwner =
      prescription.doctor.id === user.id || prescription.patient.id === user.id;

    if (!isOwner) throw new ForbiddenException('Access denied');
    return prescription;
  }

  async findPatientPrescription(doctorId: string, patientId: string) {
    const patient = await this.userRepo.findOne({
      where: {
        id: patientId,
        role: UserRole.PATIENT,
      },
    });

    if (!patient) return null;

    return await this.repo.find({
      where: {
        doctor: { id: doctorId },
        patient: { id: patientId },
      },
      relations: {
        doctor: true,
        patient: true,
        medicalRecord: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, user: User, dto: UpdatePrescriptionDto) {
    const prescription = await this.repo.findOne({
      where: {
        id,
      },
      relations: { doctor: true },
    });
    if (!prescription) return null;

    if (prescription.doctor.id !== user.id) {
      throw new ForbiddenException('only doctor can update this prescription');
    }

    Object.assign(prescription, {
      ...dto,
      expiresAt: dto.expiresAt
        ? new Date(dto.expiresAt)
        : prescription.expiresAt,
    });

    return await this.repo.save(prescription);
  }

  remove(id: number) {
    return `This action removes a #${id} prescription`;
  }
}
