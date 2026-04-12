import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorProfilePicture1775982177098 implements MigrationInterface {
    name = 'CreateDoctorProfilePicture1775982177098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_profile" ADD "profilePicture" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor_profile" ADD "profilePictureId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_profile" DROP COLUMN "profilePictureId"`);
        await queryRunner.query(`ALTER TABLE "doctor_profile" DROP COLUMN "profilePicture"`);
    }

}
