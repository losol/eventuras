using Microsoft.EntityFrameworkCore.Migrations;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class AddCertificateComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CertificateComment",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "PaymentMethods",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CertificateComment",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "PaymentMethods");
        }
    }
}
