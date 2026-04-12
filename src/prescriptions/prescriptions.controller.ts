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
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CurrentUser } from 'src/auth/decorators/current.user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Doctors can create prescription' })
  create(
    @CurrentUser() user,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.create(user, createPrescriptionDto);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.prescriptionsService.findMyPrescription(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.prescriptionsService.findOne(id, user.id);
  }

  @Get('patient/:patinetId')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get single patient prescription' })
  findPatientPrescription(
    @CurrentUser() user,
    @Param('patintId') patientId: string,
  ) {
    return this.prescriptionsService.findPatientPrescription(
      user.id,
      patientId,
    );
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Doctors can update prescription' })
  update(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(id, user.id, updatePrescriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(+id);
  }
}
