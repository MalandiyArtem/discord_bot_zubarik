import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHappyBirthdayTable1727086370166 implements MigrationInterface {
    name = 'AddHappyBirthdayTable1727086370166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "happy_birthday" ("happyBirthdayId" SERIAL NOT NULL, "userId" character varying NOT NULL, "username" character varying NOT NULL, "dateGMT0" TIMESTAMP WITH TIME ZONE NOT NULL, "shortDate" character varying NOT NULL, "happyBirthdayConfigurationConfigurationId" uuid NOT NULL, CONSTRAINT "PK_d28eabd11dc28d7c19ef5a00ea9" PRIMARY KEY ("happyBirthdayId"))`);
        await queryRunner.query(`ALTER TABLE "happy_birthday_configuration" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "happy_birthday_configuration" ADD "timeWithTimezone" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "happy_birthday_configuration" ADD "timeGMT0" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "happy_birthday" ADD CONSTRAINT "FK_00d7a6a7c93dc797a0dd4103462" FOREIGN KEY ("happyBirthdayConfigurationConfigurationId") REFERENCES "happy_birthday_configuration"("configurationId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_birthday" DROP CONSTRAINT "FK_00d7a6a7c93dc797a0dd4103462"`);
        await queryRunner.query(`ALTER TABLE "happy_birthday_configuration" DROP COLUMN "timeGMT0"`);
        await queryRunner.query(`ALTER TABLE "happy_birthday_configuration" DROP COLUMN "timeWithTimezone"`);
        await queryRunner.query(`ALTER TABLE "happy_birthday_configuration" ADD "time" TIME NOT NULL`);
        await queryRunner.query(`DROP TABLE "happy_birthday"`);
    }

}
