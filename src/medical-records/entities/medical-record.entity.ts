import { Appointment } from 'src/appointments/entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  patient: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  doctor: User;

  @OneToOne(() => Appointment, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  appointment: Appointment | null;

  @Column()
  diagnosis: string;

  @Column({ nullable: true })
  symptoms: string;

  @Column({ nullable: true })
  treatment: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isFollowUpRequired: boolean;

  @Column({ type: 'date', nullable: true })
  followUpdate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
