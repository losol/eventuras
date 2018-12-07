using Microsoft.EntityFrameworkCore.Migrations;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class AddNotNullConstraintToPaymentMethodFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "PaymentMethod",
                table: "Registrations",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PaymentMethod",
                table: "Orders",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "PaymentMethod",
                table: "Registrations",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "PaymentMethod",
                table: "Orders",
                nullable: true,
                oldClrType: typeof(int));
        }
    }
}
