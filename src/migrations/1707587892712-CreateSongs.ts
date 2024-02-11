import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSongs1707587892712 implements MigrationInterface {
    name = 'CreateSongs1707587892712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "songs" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "artist" character varying NOT NULL, "duration" integer NOT NULL, "genre" character varying NOT NULL, "album" character varying NOT NULL, CONSTRAINT "PK_e504ce8ad2e291d3a1d8f1ea2f4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "songs"`);
    }

}
