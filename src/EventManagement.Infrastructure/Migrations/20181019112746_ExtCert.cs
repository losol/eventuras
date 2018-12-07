using Microsoft.EntityFrameworkCore.Migrations;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class ExtCert : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Certificates",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "StatusComment",
                table: "Certificates",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "StatusComment",
                table: "Certificates");
        }
    }
}
