using Microsoft.EntityFrameworkCore.Migrations;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class RenameCodeToSlug : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Code",
                table: "EventInfos",
                newName: "Slug");

            migrationBuilder.AddColumn<string>(
                name: "Headline",
                table: "EventInfos",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Headline",
                table: "EventInfos");

            migrationBuilder.RenameColumn(
                name: "Slug",
                table: "EventInfos",
                newName: "Code");
        }
    }
}
