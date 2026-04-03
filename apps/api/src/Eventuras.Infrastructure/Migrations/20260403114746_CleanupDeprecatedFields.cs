using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CleanupDeprecatedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Migrate legacy Log data to BusinessEvents before dropping columns.
            // ApplicationUser.Log is jsonb and always a valid JSON array.
            // SubjectType values are lowercase to match BusinessEventSubjects factory methods.
            migrationBuilder.Sql("""
                INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "ActorUserUuid", "Message", "MetadataJson")
                SELECT uuidv7(),
                       COALESCE((elem->>'Timestamp')::timestamptz, NOW()),
                       'legacy.log', 'user', "Id",
                       CASE WHEN elem->>'UserId' IS NOT NULL AND elem->>'UserId' != ''
                            THEN (elem->>'UserId')::uuid ELSE NULL END,
                       COALESCE(elem->>'Message', ''),
                       jsonb_build_object('level', elem->>'Level', 'source', 'ApplicationUser.Log')
                FROM "Users", jsonb_array_elements("Log") AS elem
                WHERE "Log" IS NOT NULL AND "Log" != '[]';
                """);

            // Registration.Log and Order.Log were historically appended as free-text lines,
            // not JSON arrays. Try parsing as JSON; if it fails, dump the whole string as one event.
            migrationBuilder.Sql("""
                INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "Message", "MetadataJson")
                SELECT uuidv7(),
                       COALESCE((elem->>'Timestamp')::timestamptz, NOW()),
                       'legacy.log', 'registration', "Uuid",
                       COALESCE(elem->>'Text', elem->>'Message', ''),
                       jsonb_build_object('source', 'Registration.Log')
                FROM "Registrations", jsonb_array_elements("Log"::jsonb) AS elem
                WHERE "Log" IS NOT NULL AND "Log" != '' AND "Log" != '[]'
                  AND "Log"::text ~ '^\s*\[';

                INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "Message", "MetadataJson")
                SELECT uuidv7(), NOW(),
                       'legacy.log', 'registration', "Uuid",
                       "Log",
                       jsonb_build_object('source', 'Registration.Log', 'format', 'raw')
                FROM "Registrations"
                WHERE "Log" IS NOT NULL AND "Log" != ''
                  AND NOT ("Log"::text ~ '^\s*\[');
                """);

            migrationBuilder.Sql("""
                INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "Message", "MetadataJson")
                SELECT uuidv7(),
                       COALESCE((elem->>'Timestamp')::timestamptz, NOW()),
                       'legacy.log', 'order', "Uuid",
                       COALESCE(elem->>'Text', elem->>'Message', ''),
                       jsonb_build_object('source', 'Order.Log')
                FROM "Orders", jsonb_array_elements("Log"::jsonb) AS elem
                WHERE "Log" IS NOT NULL AND "Log" != '' AND "Log" != '[]'
                  AND "Log"::text ~ '^\s*\[';

                INSERT INTO "BusinessEvents" ("Uuid", "CreatedAt", "EventType", "SubjectType", "SubjectUuid", "Message", "MetadataJson")
                SELECT uuidv7(), NOW(),
                       'legacy.log', 'order', "Uuid",
                       "Log",
                       jsonb_build_object('source', 'Order.Log', 'format', 'raw')
                FROM "Orders"
                WHERE "Log" IS NOT NULL AND "Log" != ''
                  AND NOT ("Log"::text ~ '^\s*\[');
                """);

            // Migrate SuperAdmin organization roles to SystemAdmin.
            // Delete SuperAdmin rows where SystemAdmin already exists to avoid
            // duplicate composite key (OrganizationMemberId + Role).
            migrationBuilder.Sql("""
                DELETE FROM "OrganizationMemberRoles" sa
                WHERE sa."Role" = 'SuperAdmin'
                  AND EXISTS (
                    SELECT 1 FROM "OrganizationMemberRoles" sys
                    WHERE sys."OrganizationMemberId" = sa."OrganizationMemberId"
                      AND sys."Role" = 'SystemAdmin'
                  );

                UPDATE "OrganizationMemberRoles"
                SET "Role" = 'SystemAdmin'
                WHERE "Role" = 'SuperAdmin';
                """);

            // Archive ExternalSync tables (rename instead of drop)
            migrationBuilder.RenameTable(name: "ExternalRegistrations", newName: "Archived_ExternalRegistrations");
            migrationBuilder.RenameTable(name: "ExternalAccounts", newName: "Archived_ExternalAccounts");
            migrationBuilder.RenameTable(name: "ExternalEvents", newName: "Archived_ExternalEvents");

            migrationBuilder.DropColumn(
                name: "Log",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Log",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ParticipantCity",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ParticipantEmployer",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ParticipantJobTitle",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Verified",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ExternalInvoiceId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Log",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Paid",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ExternalRegistrationsUrl",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "ManageRegistrations",
                table: "EventInfos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Log",
                table: "Users",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");

            migrationBuilder.AddColumn<string>(
                name: "Log",
                table: "Registrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParticipantCity",
                table: "Registrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParticipantEmployer",
                table: "Registrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParticipantJobTitle",
                table: "Registrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Verified",
                table: "Registrations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ExternalInvoiceId",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Log",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Paid",
                table: "Orders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ExternalRegistrationsUrl",
                table: "EventInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ManageRegistrations",
                table: "EventInfos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ExternalAccounts",
                columns: table => new
                {
                    LocalId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RegistrationId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    ExternalAccountId = table.Column<string>(type: "text", nullable: false),
                    ExternalServiceName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalAccounts", x => x.LocalId);
                    table.ForeignKey(
                        name: "FK_ExternalAccounts_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId");
                    table.ForeignKey(
                        name: "FK_ExternalAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExternalEvents",
                columns: table => new
                {
                    LocalId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventInfoId = table.Column<int>(type: "integer", nullable: false),
                    ExternalEventId = table.Column<string>(type: "text", nullable: false),
                    ExternalServiceName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalEvents", x => x.LocalId);
                    table.ForeignKey(
                        name: "FK_ExternalEvents_EventInfos_EventInfoId",
                        column: x => x.EventInfoId,
                        principalTable: "EventInfos",
                        principalColumn: "EventInfoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExternalRegistrations",
                columns: table => new
                {
                    LocalId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExternalAccountId = table.Column<int>(type: "integer", nullable: false),
                    ExternalEventId = table.Column<int>(type: "integer", nullable: false),
                    RegistrationId = table.Column<int>(type: "integer", nullable: false),
                    ExternalRegistrationId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalRegistrations", x => x.LocalId);
                    table.ForeignKey(
                        name: "FK_ExternalRegistrations_ExternalAccounts_ExternalAccountId",
                        column: x => x.ExternalAccountId,
                        principalTable: "ExternalAccounts",
                        principalColumn: "LocalId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExternalRegistrations_ExternalEvents_ExternalEventId",
                        column: x => x.ExternalEventId,
                        principalTable: "ExternalEvents",
                        principalColumn: "LocalId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExternalRegistrations_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExternalAccounts_ExternalServiceName_ExternalAccountId",
                table: "ExternalAccounts",
                columns: new[] { "ExternalServiceName", "ExternalAccountId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalAccounts_RegistrationId",
                table: "ExternalAccounts",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalAccounts_UserId",
                table: "ExternalAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalEvents_EventInfoId_ExternalServiceName_ExternalEven~",
                table: "ExternalEvents",
                columns: new[] { "EventInfoId", "ExternalServiceName", "ExternalEventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalRegistrations_ExternalAccountId_ExternalEventId",
                table: "ExternalRegistrations",
                columns: new[] { "ExternalAccountId", "ExternalEventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalRegistrations_ExternalEventId",
                table: "ExternalRegistrations",
                column: "ExternalEventId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalRegistrations_RegistrationId",
                table: "ExternalRegistrations",
                column: "RegistrationId");
        }
    }
}
