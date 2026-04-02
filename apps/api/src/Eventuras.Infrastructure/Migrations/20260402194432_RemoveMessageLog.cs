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

            // Rename PK to match archived table name
            migrationBuilder.Sql(
                "ALTER TABLE \"Archived_MessageLog\" RENAME CONSTRAINT \"PK_MessageLogs\" TO \"PK_Archived_MessageLog\";");

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

            migrationBuilder.Sql(
                "ALTER TABLE \"MessageLogs\" RENAME CONSTRAINT \"PK_Archived_MessageLog\" TO \"PK_MessageLogs\";");

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
