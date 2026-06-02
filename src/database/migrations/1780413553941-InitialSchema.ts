import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1780413553941 implements MigrationInterface {
    name = 'InitialSchema1780413553941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('EMPLOYEE', 'MANAGER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'EMPLOYEE', "department_id" uuid, "reporting_manager_id" uuid, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "department" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "allocated_budget" numeric(12,2) NOT NULL DEFAULT '0', "consumed_budget" numeric(12,2) NOT NULL DEFAULT '0', "budget_currency" character varying(3) NOT NULL DEFAULT 'USD', CONSTRAINT "UQ_471da4b90e96c1ebe0af221e07b" UNIQUE ("name"), CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, "reimbursement_limit" numeric(12,2), "limit_currency" character varying(3), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exchange_rate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "source_currency" character varying(3) NOT NULL, "target_currency" character varying(3) NOT NULL, "rate" numeric(15,6) NOT NULL, "effective_from" TIMESTAMP NOT NULL, CONSTRAINT "PK_5c5d27d2b900ef6cdeef0398472" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_55222eaccf1590e2c233c75158" ON "exchange_rate"  ("source_currency", "target_currency") `);
        await queryRunner.query(`CREATE TABLE "system_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "setting_key" character varying NOT NULL, "setting_value" text NOT NULL, "description" text, CONSTRAINT "UQ_907cc0c238cbefc79fd8f768214" UNIQUE ("setting_key"), CONSTRAINT "PK_88dbc9b10c8558420acf7ea642f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "claim_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "claim_id" uuid NOT NULL, "from_status" character varying NOT NULL, "to_status" character varying NOT NULL, "changed_by_id" uuid NOT NULL, "reason" text, CONSTRAINT "PK_65b019b6e804e5f3f201353b19d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_45926a4ecbc253ec32ef949389" ON "claim_status_history"  ("claim_id") `);
        await queryRunner.query(`CREATE TABLE "approval_action" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "claim_id" uuid NOT NULL, "manager_id" uuid NOT NULL, "action" character varying NOT NULL, "approval_level" integer NOT NULL DEFAULT '1', "comment" text, CONSTRAINT "PK_6e8d36a051ed4b3f6a14e7aebdb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0595f771e52655fdee1e734dd4" ON "approval_action"  ("claim_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c7aadab058c33c3812ab5f1fe9" ON "approval_action"  ("manager_id") `);
        await queryRunner.query(`CREATE TABLE "reimbursement_claim" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "claim_number" character varying NOT NULL, "user_id" uuid NOT NULL, "department_id" uuid, "status" character varying NOT NULL DEFAULT 'DRAFT', "total_amount" numeric(12,2) NOT NULL DEFAULT '0', "approved_amount" numeric(12,2), "employee_notes" text, "submitted_at" TIMESTAMP, "resolved_at" TIMESTAMP, CONSTRAINT "UQ_a6393bcdd6296929c9eec47a609" UNIQUE ("claim_number"), CONSTRAINT "PK_f9644252e38b7e392f571e4f188" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_20013a0bd0a31f74ebebf535f7" ON "reimbursement_claim"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "expense" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "user_id" uuid NOT NULL, "category_id" uuid NOT NULL, "claim_id" uuid, "amount" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL, "converted_amount" numeric(12,2), "base_currency" character varying(3), "expense_date" date NOT NULL, "notes" text, "is_reimbursable" boolean NOT NULL DEFAULT true, "has_policy_violation" boolean NOT NULL DEFAULT false, "policy_violation_reason" text, "receipt_file_path" character varying, CONSTRAINT "PK_edd925b450e13ea36197c9590fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "entity_type" character varying NOT NULL, "entity_id" uuid NOT NULL, "action" character varying NOT NULL, "actor_id" uuid, "old_values" jsonb, "new_values" jsonb, "ip_address" character varying, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2cbcf87a54ac23c6294ada82ee" ON "audit_log"  ("entity_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_c6c5d74b38ecfe778182348e7c" ON "audit_log"  ("entity_id") `);
        await queryRunner.query(`ALTER TABLE "claim_status_history" ADD CONSTRAINT "FK_45926a4ecbc253ec32ef9493895" FOREIGN KEY ("claim_id") REFERENCES "reimbursement_claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claim_status_history" ADD CONSTRAINT "FK_fc50bf1ee9fe5528b56d5bc624a" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval_action" ADD CONSTRAINT "FK_0595f771e52655fdee1e734dd42" FOREIGN KEY ("claim_id") REFERENCES "reimbursement_claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval_action" ADD CONSTRAINT "FK_c7aadab058c33c3812ab5f1fe96" FOREIGN KEY ("manager_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reimbursement_claim" ADD CONSTRAINT "FK_20013a0bd0a31f74ebebf535f71" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reimbursement_claim" ADD CONSTRAINT "FK_52866bbb666b4c0abdf2c73bdbd" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_8aed1abe692b31639ccde1b0416" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_478b68a9314d8787fb3763a2298" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_384f058815790336aac12e4b92c" FOREIGN KEY ("claim_id") REFERENCES "reimbursement_claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_15a6f5aad57db494c17986ed2e2" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_15a6f5aad57db494c17986ed2e2"`);
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_384f058815790336aac12e4b92c"`);
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_478b68a9314d8787fb3763a2298"`);
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_8aed1abe692b31639ccde1b0416"`);
        await queryRunner.query(`ALTER TABLE "reimbursement_claim" DROP CONSTRAINT "FK_52866bbb666b4c0abdf2c73bdbd"`);
        await queryRunner.query(`ALTER TABLE "reimbursement_claim" DROP CONSTRAINT "FK_20013a0bd0a31f74ebebf535f71"`);
        await queryRunner.query(`ALTER TABLE "approval_action" DROP CONSTRAINT "FK_c7aadab058c33c3812ab5f1fe96"`);
        await queryRunner.query(`ALTER TABLE "approval_action" DROP CONSTRAINT "FK_0595f771e52655fdee1e734dd42"`);
        await queryRunner.query(`ALTER TABLE "claim_status_history" DROP CONSTRAINT "FK_fc50bf1ee9fe5528b56d5bc624a"`);
        await queryRunner.query(`ALTER TABLE "claim_status_history" DROP CONSTRAINT "FK_45926a4ecbc253ec32ef9493895"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c6c5d74b38ecfe778182348e7c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cbcf87a54ac23c6294ada82ee"`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
        await queryRunner.query(`DROP TABLE "expense"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_20013a0bd0a31f74ebebf535f7"`);
        await queryRunner.query(`DROP TABLE "reimbursement_claim"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7aadab058c33c3812ab5f1fe9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0595f771e52655fdee1e734dd4"`);
        await queryRunner.query(`DROP TABLE "approval_action"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_45926a4ecbc253ec32ef949389"`);
        await queryRunner.query(`DROP TABLE "claim_status_history"`);
        await queryRunner.query(`DROP TABLE "system_setting"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55222eaccf1590e2c233c75158"`);
        await queryRunner.query(`DROP TABLE "exchange_rate"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "department"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
