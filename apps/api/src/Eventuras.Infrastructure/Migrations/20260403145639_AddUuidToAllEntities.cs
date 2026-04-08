using System;
using System.Linq;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUuidToAllEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Auth",
                table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "CertificateGuid",
                table: "Certificates",
                newName: "Uuid");

            // Deduplicate Certificates.Uuid. Production data contains
            // multiple rows with the zero UUID (and possibly other
            // duplicates) from before CertificateGuid was treated as unique.
            // Regenerate every row that shares its Uuid with another row so
            // the upcoming unique index can be created.
            migrationBuilder.Sql(@"
                UPDATE ""Certificates"" SET ""Uuid"" = uuidv7()
                WHERE ""Uuid"" IN (
                    SELECT ""Uuid"" FROM ""Certificates""
                    GROUP BY ""Uuid"" HAVING COUNT(*) > 1
                );
            ");

            // Add Uuid columns as nullable first, then backfill, then set NOT NULL.
            // This avoids the PostgreSQL "fast default" optimization which could
            // assign the same default value to all existing rows.
            var tables = new[]
            {
                "ProductVariants", "Products", "Organizations", "OrganizationMembers",
                "OrderLines", "NotificationStatistics", "Notifications",
                "NotificationRecipients", "Invoices", "EventInfos", "EventCollections"
            };

            foreach (var table in tables)
            {
                migrationBuilder.AddColumn<Guid>(
                    name: "Uuid",
                    table: table,
                    type: "uuid",
                    nullable: true);
            }

            migrationBuilder.Sql(string.Join("\n", tables.Select(t => $"""
                UPDATE "{t}" SET "Uuid" = uuidv7() WHERE "Uuid" IS NULL;
                ALTER TABLE "{t}" ALTER COLUMN "Uuid" SET DEFAULT uuidv7();
                ALTER TABLE "{t}" ALTER COLUMN "Uuid" SET NOT NULL;
                """)));

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_Uuid",
                table: "ProductVariants",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_Uuid",
                table: "Products",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Uuid",
                table: "Organizations",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembers_Uuid",
                table: "OrganizationMembers",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_Uuid",
                table: "OrderLines",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationStatistics_Uuid",
                table: "NotificationStatistics",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Uuid",
                table: "Notifications",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationRecipients_Uuid",
                table: "NotificationRecipients",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Uuid",
                table: "Invoices",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventInfos_Uuid",
                table: "EventInfos",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventCollections_Uuid",
                table: "EventCollections",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_Uuid",
                table: "Certificates",
                column: "Uuid",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductVariants_Uuid",
                table: "ProductVariants");

            migrationBuilder.DropIndex(
                name: "IX_Products_Uuid",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_Uuid",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_OrganizationMembers_Uuid",
                table: "OrganizationMembers");

            migrationBuilder.DropIndex(
                name: "IX_OrderLines_Uuid",
                table: "OrderLines");

            migrationBuilder.DropIndex(
                name: "IX_NotificationStatistics_Uuid",
                table: "NotificationStatistics");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_Uuid",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_NotificationRecipients_Uuid",
                table: "NotificationRecipients");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_Uuid",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_EventInfos_Uuid",
                table: "EventInfos");

            migrationBuilder.DropIndex(
                name: "IX_EventCollections_Uuid",
                table: "EventCollections");

            migrationBuilder.DropIndex(
                name: "IX_Certificates_Uuid",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "OrganizationMembers");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "OrderLines");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "NotificationStatistics");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "NotificationRecipients");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "EventCollections");

            migrationBuilder.RenameColumn(
                name: "Uuid",
                table: "Certificates",
                newName: "CertificateGuid");

            migrationBuilder.AddColumn<Guid>(
                name: "Auth",
                table: "Certificates",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()");
        }
    }
}
