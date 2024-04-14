import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleMessageAdd1713093392577 implements MigrationInterface {
    name = 'ScheduleMessageAdd1713093392577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scheduled_message" ("scheduleMessageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "authorId" character varying NOT NULL, "channelId" character varying NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "readableDate" character varying NOT NULL, "attachmentUrl" character varying, "message" character varying, "gifUrl" character varying, "guildGuildId" character varying, CONSTRAINT "PK_aa7c458f968f5f098794d1680b2" PRIMARY KEY ("scheduleMessageId"))`);
        await queryRunner.query(`ALTER TABLE "scheduled_message" ADD CONSTRAINT "FK_df3b596cadeb2ffda93d87bfe2c" FOREIGN KEY ("guildGuildId") REFERENCES "guilds"("guildId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduled_message" DROP CONSTRAINT "FK_df3b596cadeb2ffda93d87bfe2c"`);
        await queryRunner.query(`DROP TABLE "scheduled_message"`);
    }

}
