using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Migrations
{
    public partial class paymentmethods : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Registrations");

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethodId",
                table: "Registrations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PaymentMethods",
                columns: table => new
                {
                    PaymentMethodId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(75)", maxLength: 75, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethods", x => x.PaymentMethodId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_PaymentMethodId",
                table: "Registrations",
                column: "PaymentMethodId");

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_PaymentMethods_PaymentMethodId",
                table: "Registrations",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "PaymentMethodId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_PaymentMethods_PaymentMethodId",
                table: "Registrations");

            migrationBuilder.DropTable(
                name: "PaymentMethods");

            migrationBuilder.DropIndex(
                name: "IX_Registrations_PaymentMethodId",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "Registrations");

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "Registrations",
                nullable: true);
        }
    }
}
