using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMessageLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop FK and index so archived data is fully decoupled from EventInfos
            migrationBuilder.DropForeignKey(
                name: "FK_MessageLogs_EventInfos_EventInfoId",
                table: "MessageLogs");

            migrationBuilder.DropIndex(
                name: "IX_MessageLogs_EventInfoId",
                table: "MessageLogs");

            // Rename instead of drop to keep a backup
            migrationBuilder.RenameTable(
                name: "MessageLogs",
                newName: "Archived_MessageLog");

            // Rename PK to match archived table name. Look up the actual
            // constraint name dynamically: production databases may have been
            // created with a different PK name (e.g. from an older EF Core
            // naming convention), so we can't assume it is "PK_MessageLogs".
            migrationBuilder.Sql(@"
DO $$
DECLARE
    pk_name text;
BEGIN
    SELECT conname INTO pk_name
    FROM pg_constraint
    WHERE conrelid = '""Archived_MessageLog""'::regclass
      AND contype = 'p';

    IF pk_name IS NOT NULL AND pk_name <> 'PK_Archived_MessageLog' THEN
        EXECUTE format('ALTER TABLE ""Archived_MessageLog"" RENAME CONSTRAINT %I TO ""PK_Archived_MessageLog""', pk_name);
    END IF;
END $$;
");

            migrationBuilder.DropColumn(
                name: "RegistrationBy",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "VerificationCode",
                table: "Registrations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RegistrationBy",
                table: "Registrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationCode",
                table: "Registrations",
                type: "text",
                nullable: true);

            migrationBuilder.RenameTable(
                name: "Archived_MessageLog",
                newName: "MessageLogs");

            migrationBuilder.Sql(@"
DO $$
DECLARE
    pk_name text;
BEGIN
    SELECT conname INTO pk_name
    FROM pg_constraint
    WHERE conrelid = '""MessageLogs""'::regclass
      AND contype = 'p';

    IF pk_name IS NOT NULL AND pk_name <> 'PK_MessageLogs' THEN
        EXECUTE format('ALTER TABLE ""MessageLogs"" RENAME CONSTRAINT %I TO ""PK_MessageLogs""', pk_name);
    END IF;
END $$;
");

            migrationBuilder.CreateIndex(
                name: "IX_MessageLogs_EventInfoId",
                table: "MessageLogs",
                column: "EventInfoId");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageLogs_EventInfos_EventInfoId",
                table: "MessageLogs",
                column: "EventInfoId",
                principalTable: "EventInfos",
                principalColumn: "EventInfoId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
