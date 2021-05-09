using Microsoft.EntityFrameworkCore.Migrations;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class RequireEventOrganization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventInfos_Organizations_OrganizationId",
                table: "EventInfos");

            migrationBuilder.AlterColumn<int>(
                name: "OrganizationId",
                table: "EventInfos",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EventInfos_Organizations_OrganizationId",
                table: "EventInfos",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "OrganizationId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventInfos_Organizations_OrganizationId",
                table: "EventInfos");

            migrationBuilder.AlterColumn<int>(
                name: "OrganizationId",
                table: "EventInfos",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_EventInfos_Organizations_OrganizationId",
                table: "EventInfos",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "OrganizationId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
