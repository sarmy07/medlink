import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from './entities/user.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CurrentUser } from 'src/auth/decorators/current.user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/cloudinary/pipes/file-validation.pipe';
import { memoryStorage } from 'multer';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile/doctor/picture')
  @Roles(UserRole.DOCTOR)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadProfilePicture(
    @CurrentUser() user,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ) {
    return this.usersService.uploadProfilePicture(user.id, file);
  }

  @Get('me')
  getMe(@Req() req) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('profile/doctor')
  @Roles(UserRole.DOCTOR)
  updateDoctorProfile(@Req() req, @Body() dto: UpdateDoctorDto) {
    return this.usersService.updateDoctorProfile(req.user.id, dto);
  }

  @Patch('profile/patient')
  @Roles(UserRole.PATIENT)
  updatePatientProfile(@Req() req, @Body() dto: UpdatePatientDto) {
    return this.usersService.updateDoctorProfile(req.user.id, dto);
  }

  @Get('doctors')
  getAllDoctors() {
    return this.usersService.getAllDoctors();
  }

  @Get('doctors/:id')
  getDoctorById(@Param('id') id: string) {
    return this.usersService.findDoctorById(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
