using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Migrations
{
    public partial class paymethods : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_PaymentMethods_PaymentMethodId",
                table: "Registrations");

            migrationBuilder.AlterColumn<int>(
                name: "PaymentMethodId",
                table: "Registrations",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_PaymentMethods_PaymentMethodId",
                table: "Registrations",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "PaymentMethodId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_PaymentMethods_PaymentMethodId",
                table: "Registrations");

            migrationBuilder.AlterColumn<int>(
                name: "PaymentMethodId",
                table: "Registrations",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_PaymentMethods_PaymentMethodId",
                table: "Registrations",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "PaymentMethodId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
