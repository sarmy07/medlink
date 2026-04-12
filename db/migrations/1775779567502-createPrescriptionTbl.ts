import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePrescriptionTbl1775779567502 implements MigrationInterface {
    name = 'CreatePrescriptionTbl1775779567502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."prescription_status_enum" AS ENUM('active', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "prescription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "medication" jsonb NOT NULL, "notes" character varying, "status" "public"."prescription_status_enum" NOT NULL DEFAULT 'active', "expiresAt" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "doctorId" uuid, "patientId" uuid, "medicalRecordId" uuid, CONSTRAINT "PK_eaba5e4414e5382781e08467b51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "prescription" ADD CONSTRAINT "FK_3e4a39a72939d42f31039f25ae6" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription" ADD CONSTRAINT "FK_d9d1ecabc97e4de5c07a1795279" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription" ADD CONSTRAINT "FK_daaad6a1b61f197a66be0185515" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prescription" DROP CONSTRAINT "FK_daaad6a1b61f197a66be0185515"`);
        await queryRunner.query(`ALTER TABLE "prescription" DROP CONSTRAINT "FK_d9d1ecabc97e4de5c07a1795279"`);
        await queryRunner.query(`ALTER TABLE "prescription" DROP CONSTRAINT "FK_3e4a39a72939d42f31039f25ae6"`);
        await queryRunner.query(`DROP TABLE "prescription"`);
        await queryRunner.query(`DROP TYPE "public"."prescription_status_enum"`);
    }

}
