import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { DoctorProfile } from './entities/doctor.profile.entity';
import { PatientProfile } from './entities/patient.profile.entity';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DoctorProfile)
    private readonly doctorRepo: Repository<DoctorProfile>,

    @InjectRepository(PatientProfile)
    private readonly patientRepo: Repository<PatientProfile>,
    private readonly cloudinaryProvider: CloudinaryProvider,
  ) {}

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException();

    if (user.role === UserRole.DOCTOR) {
      const profile = await this.doctorRepo.findOne({
        where: {
          user: {
            id: userId,
          },
        },
        relations: { user: true },
      });
      return { ...user, profile: profile ?? null };
    }

    const profile = await this.patientRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: { user: true },
    });
    return { ...user, profile: profile ?? null };
  }

  async updateDoctorProfile(userId: string, dto: UpdateDoctorDto) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException();

    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('only doctors can perform this action');
    }

    let profile = await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (!profile) {
      profile = this.doctorRepo.create({ user, ...dto });
    } else {
      Object.assign(profile, dto);
    }

    return this.doctorRepo.save(profile);
  }

  async updatePatientProfile(userId: string, dto: UpdatePatientDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('user not found');

    if (user.role !== UserRole.PATIENT) {
      throw new ForbiddenException('only patient can perfomr this action');
    }

    let profile = await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (!profile) {
      profile = this.patientRepo.create({ user, ...dto });
    } else {
      Object.assign(profile, dto);
    }

    return this.patientRepo.save(profile);
  }

  async getAllDoctors() {
    return this.doctorRepo.find({
      relations: { user: true },
      where: { isAvailable: true },
    });
  }

  async findDoctorById(doctorId: string) {
    const profile = await this.doctorRepo.findOne({
      where: {
        user: { id: doctorId },
      },
      relations: { user: true },
    });
    if (!profile) throw new NotFoundException('doctor not found');
    return profile;
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        role: UserRole.DOCTOR,
      },
    });

    if (!user) return null;

    let profile = await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (profile?.profilePicture) {
      await this.cloudinaryProvider.deleteImage(profile.profilePictureId);
    }

    const result = await this.cloudinaryProvider.uploadImage(
      file,
      'blog-posts',
    );

    if (!profile) {
      profile = this.doctorRepo.create({ user });
    }

    profile.profilePicture = result.secure_url;
    profile.profilePictureId = result.public_id;

    return await this.doctorRepo.save(profile);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findEmail(email: string) {
    return await this.userRepo.findOne({
      where: {
        email,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
