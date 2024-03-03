import { MigrationInterface, QueryRunner } from "typeorm";

export class ReactionsAdd1709477656618 implements MigrationInterface {
    name = 'ReactionsAdd1709477656618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "emojis" text NOT NULL, "userIds" text NOT NULL, "channelIds" text NOT NULL, "guildGuildId" character varying, CONSTRAINT "UQ_f07671767be1bbbaeb7efc943a9" UNIQUE ("name"), CONSTRAINT "PK_0b213d460d0c473bc2fb6ee27f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reactions" ADD CONSTRAINT "FK_7db0e7c12d960025d70f6a3c537" FOREIGN KEY ("guildGuildId") REFERENCES "guilds"("guildId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reactions" DROP CONSTRAINT "FK_7db0e7c12d960025d70f6a3c537"`);
        await queryRunner.query(`DROP TABLE "reactions"`);
    }

}
