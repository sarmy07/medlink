import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedPasswordToNullableInUserTable1780534745326 implements MigrationInterface {
    name = 'ChangedPasswordToNullableInUserTable1780534745326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
    }

}
