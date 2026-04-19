using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessEventOrganizationLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Organizations_Uuid",
                table: "Organizations");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationUuid",
                table: "BusinessEvents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Organizations_Uuid",
                table: "Organizations",
                column: "Uuid");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessEvents_OrganizationUuid",
                table: "BusinessEvents",
                column: "OrganizationUuid");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessEvents_OrganizationUuid_SubjectType_SubjectUuid",
                table: "BusinessEvents",
                columns: new[] { "OrganizationUuid", "SubjectType", "SubjectUuid" });

            migrationBuilder.AddForeignKey(
                name: "FK_BusinessEvents_Organizations_OrganizationUuid",
                table: "BusinessEvents",
                column: "OrganizationUuid",
                principalTable: "Organizations",
                principalColumn: "Uuid",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BusinessEvents_Organizations_OrganizationUuid",
                table: "BusinessEvents");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Organizations_Uuid",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_BusinessEvents_OrganizationUuid",
                table: "BusinessEvents");

            migrationBuilder.DropIndex(
                name: "IX_BusinessEvents_OrganizationUuid_SubjectType_SubjectUuid",
                table: "BusinessEvents");

            migrationBuilder.DropColumn(
                name: "OrganizationUuid",
                table: "BusinessEvents");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Uuid",
                table: "Organizations",
                column: "Uuid",
                unique: true);
        }
    }
}
