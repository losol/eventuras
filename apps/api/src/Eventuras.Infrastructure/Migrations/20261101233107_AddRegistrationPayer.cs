using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistrationPayer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerContactName",
                table: "Registrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PayerType",
                table: "Registrations",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerContactName",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "PayerType",
                table: "Registrations");
        }
    }
}
