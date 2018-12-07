using Microsoft.EntityFrameworkCore.Migrations;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class eventi : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "EventInfos",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "EventInfos",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "EventInfos");
        }
    }
}
