import { MigrationInterface, QueryRunner } from "typeorm";

export class ShadowBanAdd1708874995558 implements MigrationInterface {
    name = 'ShadowBanAdd1708874995558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shadow_ban" ("banId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "userIds" text NOT NULL, "channelIds" text NOT NULL, "guildGuildId" character varying, CONSTRAINT "UQ_e8dea5fd2cd285bbbeecb1699aa" UNIQUE ("name"), CONSTRAINT "PK_09f1b09fad229751ec080548e91" PRIMARY KEY ("banId"))`);
        await queryRunner.query(`ALTER TABLE "shadow_ban" ADD CONSTRAINT "FK_f6718519d931c5bffafe2b8b18a" FOREIGN KEY ("guildGuildId") REFERENCES "guilds"("guildId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shadow_ban" DROP CONSTRAINT "FK_f6718519d931c5bffafe2b8b18a"`);
        await queryRunner.query(`DROP TABLE "shadow_ban"`);
    }

}
