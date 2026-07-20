import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1721234567890 implements MigrationInterface {
    name = 'InitialMigration1721234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "email" character varying NOT NULL,
            "password" character varying NOT NULL,
            "firstName" character varying NOT NULL,
            "lastName" character varying NOT NULL,
            "avatarUrl" character varying,
            "bio" character varying DEFAULT '',
            "isVerified" boolean NOT NULL DEFAULT false,
            "isActive" boolean NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
            CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "conversations" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying,
            "isGroup" boolean NOT NULL DEFAULT false,
            "avatarUrl" character varying,
            "lastMessageAt" TIMESTAMP,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_9b94f6a4a0a8b4b3b8e7b5b6c8f" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "conversation_members" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "userId" uuid NOT NULL,
            "conversationId" uuid NOT NULL,
            "isAdmin" boolean NOT NULL DEFAULT false,
            "isMuted" boolean NOT NULL DEFAULT false,
            "lastReadAt" TIMESTAMP,
            "unreadCount" integer NOT NULL DEFAULT 0,
            "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_65f012a0c9cf0fd3b2efbcf0b1d" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "messages" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "senderId" uuid NOT NOT NULL,
            "conversationId" uuid NOT NULL,
            "content" text NOT NULL,
            "type" character varying NOT NULL DEFAULT 'text',
            "metadata" jsonb,
            "isEdited" boolean NOT NULL DEFAULT false,
            "editedAt" TIMESTAMP,
            "isDeleted" boolean NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_78bc7a10aef5f1f6dc6a9b7e65e" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "conversation_members" ADD CONSTRAINT "FK_user_id" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_members" ADD CONSTRAINT "FK_conversation_id" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_sender_id" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_conversation_id" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_conversation_id"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_sender_id"`);
        await queryRunner.query(`ALTER TABLE "conversation_members" DROP CONSTRAINT "FK_conversation_id"`);
        await queryRunner.query(`ALTER TABLE "conversation_members" DROP CONSTRAINT "FK_user_id"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "conversation_members"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}