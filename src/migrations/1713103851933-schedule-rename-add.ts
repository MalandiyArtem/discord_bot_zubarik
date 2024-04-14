import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleRenameAdd1713103851933 implements MigrationInterface {
    name = 'ScheduleRenameAdd1713103851933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scheduled_rename" ("scheduleRenameId" uuid NOT NULL DEFAULT uuid_generate_v4(), "authorId" character varying NOT NULL, "channelId" character varying NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "readableDate" character varying NOT NULL, "newChannelName" character varying NOT NULL, "guildGuildId" character varying, CONSTRAINT "PK_6bf6df0db7a72ac14330b56db2a" PRIMARY KEY ("scheduleRenameId"))`);
        await queryRunner.query(`ALTER TABLE "scheduled_rename" ADD CONSTRAINT "FK_68bd44bf8b94f762c1d9462762e" FOREIGN KEY ("guildGuildId") REFERENCES "guilds"("guildId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduled_rename" DROP CONSTRAINT "FK_68bd44bf8b94f762c1d9462762e"`);
        await queryRunner.query(`DROP TABLE "scheduled_rename"`);
    }

}
