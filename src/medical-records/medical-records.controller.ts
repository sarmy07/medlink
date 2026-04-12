import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CurrentUser } from 'src/auth/decorators/current.user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Medical-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create medical records(doctors only)' })
  create(
    @CurrentUser() user,
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.create(user, createMedicalRecordDto);
  }

  @Get()
  findMyRecords(@CurrentUser() user) {
    return this.medicalRecordsService.findMyRecords(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.medicalRecordsService.findOne(id, user);
  }

  @Get('patient/:patientId')
  findPatientRecords(
    @Param('patientId') patientId: string,
    @CurrentUser() user,
  ) {
    return this.medicalRecordsService.findPatientReords(patientId, user.id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update medical records(doctors only)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(
      id,
      user.id,
      updateMedicalRecordDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'This endpoint is not needed, dont hit it!' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.medicalRecordsService.remove(id, user.id);
  }
}
