using Microsoft.EntityFrameworkCore.Migrations;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class LmsEnrollmentFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EnrolledInLms",
                table: "Registrations",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LmsCourseId",
                table: "EventInfos",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnrolledInLms",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "LmsCourseId",
                table: "EventInfos");
        }
    }
}
