import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMedicalRecordTbl1775686422960 implements MigrationInterface {
    name = 'CreateMedicalRecordTbl1775686422960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medical_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "diagnosis" character varying NOT NULL, "symptoms" character varying, "treatment" character varying, "notes" character varying, "isFollowUpRequired" boolean NOT NULL DEFAULT false, "followUpdate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" uuid, "doctorId" uuid, "appointmentId" uuid, CONSTRAINT "REL_31bef5f9acc117db52116ee09b" UNIQUE ("appointmentId"), CONSTRAINT "PK_c200c0b76638124b7ed51424823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_31bef5f9acc117db52116ee09be" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_31bef5f9acc117db52116ee09be"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407"`);
        await queryRunner.query(`DROP TABLE "medical_records"`);
    }

}
