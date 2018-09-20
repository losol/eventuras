using Microsoft.EntityFrameworkCore.Migrations;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class ExtInfoPage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RegistrationsUrl",
                table: "EventInfos",
                newName: "ExternalRegistrationsUrl");

            migrationBuilder.AddColumn<string>(
                name: "ExternalInfoPageUrl",
                table: "EventInfos",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalInfoPageUrl",
                table: "EventInfos");

            migrationBuilder.RenameColumn(
                name: "ExternalRegistrationsUrl",
                table: "EventInfos",
                newName: "RegistrationsUrl");
        }
    }
}
