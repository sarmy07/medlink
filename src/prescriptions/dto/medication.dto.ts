import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MedicationDto {
  @ApiProperty({ example: 'Amoxicilin' })
  @IsString()
  name: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  dosage: string;

  @ApiProperty({ example: 'Twice daily' })
  @IsString()
  frequency: string;

  @ApiProperty({ example: '7 days' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 'Take after meals' })
  @IsOptional()
  @IsString()
  isntruction?: string;
}
