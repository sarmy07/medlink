import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'uuid of the doctor' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ example: '2025-06-01T01:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}
