import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGuild1708272149038 implements MigrationInterface {
    name = 'CreateGuild1708272149038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "guilds" ("guildId" character varying NOT NULL, "name" character varying NOT NULL, "logChannelId" character varying, "ownerId" character varying NOT NULL, CONSTRAINT "PK_0699c7df346fa7be967e7eebd51" PRIMARY KEY ("guildId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "guilds"`);
    }

}
