using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUuidToOrganizationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Added nullable and backfilled row by row before being made NOT NULL:
            // PostgreSQL's fast default would give every existing row the same uuid,
            // which the unique index below would then reject.
            migrationBuilder.AddColumn<Guid>(
                name: "Uuid",
                table: "OrganizationSettings",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "OrganizationSettings" SET "Uuid" = uuidv7() WHERE "Uuid" IS NULL;
                ALTER TABLE "OrganizationSettings" ALTER COLUMN "Uuid" SET DEFAULT uuidv7();
                ALTER TABLE "OrganizationSettings" ALTER COLUMN "Uuid" SET NOT NULL;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationSettings_Uuid",
                table: "OrganizationSettings",
                column: "Uuid",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OrganizationSettings_Uuid",
                table: "OrganizationSettings");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "OrganizationSettings");
        }
    }
}
