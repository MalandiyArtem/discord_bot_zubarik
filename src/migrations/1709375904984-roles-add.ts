import { MigrationInterface, QueryRunner } from "typeorm";

export class RolesAdd1709375904984 implements MigrationInterface {
    name = 'RolesAdd1709375904984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "roleId" character varying NOT NULL, "guildId" character varying, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_06fc9556b77dfbf53f03b6d3379" FOREIGN KEY ("guildId") REFERENCES "guilds"("guildId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_06fc9556b77dfbf53f03b6d3379"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
