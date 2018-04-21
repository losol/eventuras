using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class organizations3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "EventInfos",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OrganizerUserId",
                table: "EventInfos",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    OrganizationId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Description = table.Column<string>(maxLength: 300, nullable: true),
                    Email = table.Column<string>(maxLength: 300, nullable: false),
                    LogoBase64 = table.Column<string>(nullable: true),
                    LogoUrl = table.Column<string>(maxLength: 300, nullable: true),
                    Name = table.Column<string>(nullable: false),
                    Phone = table.Column<string>(maxLength: 300, nullable: true),
                    Url = table.Column<string>(maxLength: 300, nullable: false),
                    VatId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.OrganizationId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventInfos_OrganizationId",
                table: "EventInfos",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_EventInfos_OrganizerUserId",
                table: "EventInfos",
                column: "OrganizerUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_EventInfos_Organizations_OrganizationId",
                table: "EventInfos",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "OrganizationId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EventInfos_AspNetUsers_OrganizerUserId",
                table: "EventInfos",
                column: "OrganizerUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventInfos_Organizations_OrganizationId",
                table: "EventInfos");

            migrationBuilder.DropForeignKey(
                name: "FK_EventInfos_AspNetUsers_OrganizerUserId",
                table: "EventInfos");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_EventInfos_OrganizationId",
                table: "EventInfos");

            migrationBuilder.DropIndex(
                name: "IX_EventInfos_OrganizerUserId",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "OrganizerUserId",
                table: "EventInfos");
        }
    }
}
