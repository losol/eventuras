using Microsoft.EntityFrameworkCore.Migrations;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class EventInfoArchivedField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Archived",
                table: "EventInfos",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Archived",
                table: "EventInfos");
        }
    }
}
