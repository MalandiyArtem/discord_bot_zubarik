import { MigrationInterface, QueryRunner } from "typeorm";

export class AddYear1707588382917 implements MigrationInterface {
    name = 'AddYear1707588382917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "songs" ADD "year" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "year"`);
    }

}
