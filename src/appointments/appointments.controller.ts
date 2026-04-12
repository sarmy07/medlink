import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Booke an appointment' })
  create(
    @Param('patientId') id: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(id, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'View own appointments' })
  findMyAppointments(@Req() req) {
    return this.appointmentsService.findMyAppointments(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View single operation' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.appointmentsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update(confirm/cancel/rescehdule)' })
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(
      id,
      req.user.id,
      updateAppointmentDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Delete pending appointment' })
  remove(@Param('id') id: string, @Req() req) {
    return this.appointmentsService.remove(id, req.user.id);
  }
}
