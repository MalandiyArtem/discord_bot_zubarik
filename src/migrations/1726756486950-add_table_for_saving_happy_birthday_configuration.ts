import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableForSavingHappyBirthdayConfiguration1726756486950 implements MigrationInterface {
    name = 'AddTableForSavingHappyBirthdayConfiguration1726756486950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "happy_birthday_configuration" ("configurationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "channelId" character varying, "time" TIME NOT NULL, "timezone" character varying NOT NULL, CONSTRAINT "PK_61ef8cdf64fd661f8fc162f2696" PRIMARY KEY ("configurationId"))`);
        await queryRunner.query(`ALTER TABLE "guilds" ADD "happy_birthday_configuration_id" uuid`);
        await queryRunner.query(`ALTER TABLE "guilds" ADD CONSTRAINT "UQ_9473a40b14a08c63aa0b035abb7" UNIQUE ("happy_birthday_configuration_id")`);
        await queryRunner.query(`ALTER TABLE "guilds" ADD CONSTRAINT "FK_9473a40b14a08c63aa0b035abb7" FOREIGN KEY ("happy_birthday_configuration_id") REFERENCES "happy_birthday_configuration"("configurationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guilds" DROP CONSTRAINT "FK_9473a40b14a08c63aa0b035abb7"`);
        await queryRunner.query(`ALTER TABLE "guilds" DROP CONSTRAINT "UQ_9473a40b14a08c63aa0b035abb7"`);
        await queryRunner.query(`ALTER TABLE "guilds" DROP COLUMN "happy_birthday_configuration_id"`);
        await queryRunner.query(`DROP TABLE "happy_birthday_configuration"`);
    }

}
