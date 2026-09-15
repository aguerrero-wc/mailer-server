import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1789488000000 implements MigrationInterface {
  name = 'InitialSchema1789488000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "name" character varying NOT NULL, "filename" character varying NOT NULL, "subject" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_996873c57c54937eba59605def3" UNIQUE ("slug"), CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipient" character varying NOT NULL, "sentAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL DEFAULT 'SUCCESS', "providerId" character varying, "errorMessage" text, "metadata" jsonb, "templateId" uuid NOT NULL, CONSTRAINT "PK_999382218924e953a790d340571" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "security_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "eventType" character varying NOT NULL, "sourceIp" character varying NOT NULL, "endpoint" character varying NOT NULL, "method" character varying NOT NULL, "payload" jsonb, "description" character varying NOT NULL, CONSTRAINT "PK_48ce9a9a3215af82611525ce08b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_logs" ADD CONSTRAINT "FK_ab0bc5e579ddef159c3dc697503" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_logs" DROP CONSTRAINT "FK_ab0bc5e579ddef159c3dc697503"`,
    );
    await queryRunner.query(`DROP TABLE "security_logs"`);
    await queryRunner.query(`DROP TABLE "email_logs"`);
    await queryRunner.query(`DROP TABLE "templates"`);
  }
}
