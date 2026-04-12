import { MigrationInterface, QueryRunner } from "typeorm";

export class Profiles1775603962764 implements MigrationInterface {
    name = 'Profiles1775603962764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."patient_profile_bloodgroup_enum" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')`);
        await queryRunner.query(`CREATE TABLE "patient_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateOfBirth" date, "bloodGroup" "public"."patient_profile_bloodgroup_enum", "phone" character varying, "address" character varying, "allergies" character varying, "emergencyContactName" character varying, "emergencyContactPhone" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_1de3767e7d351c683f4f8923ae" UNIQUE ("userId"), CONSTRAINT "PK_17f75e7aa12a2d0b0c3924b2e81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specialization" character varying NOT NULL, "licenseNumber" character varying NOT NULL, "qualification" character varying, "bio" character varying, "phone" character varying, "isAvailable" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_3137f271511788a78b208b86779" UNIQUE ("licenseNumber"), CONSTRAINT "REL_f3a33e785199cebab93b11d123" UNIQUE ("userId"), CONSTRAINT "PK_644ccb5654dfad6ae661c5684aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_profile" ADD CONSTRAINT "FK_1de3767e7d351c683f4f8923aef" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "FK_f3a33e785199cebab93b11d1237" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT "FK_f3a33e785199cebab93b11d1237"`);
        await queryRunner.query(`ALTER TABLE "patient_profile" DROP CONSTRAINT "FK_1de3767e7d351c683f4f8923aef"`);
        await queryRunner.query(`DROP TABLE "doctor_profile"`);
        await queryRunner.query(`DROP TABLE "patient_profile"`);
        await queryRunner.query(`DROP TYPE "public"."patient_profile_bloodgroup_enum"`);
    }

}
