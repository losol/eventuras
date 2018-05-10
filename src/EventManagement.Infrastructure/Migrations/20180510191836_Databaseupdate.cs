using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class Databaseupdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AdminOnly",
                table: "PaymentMethods",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentProvider",
                table: "PaymentMethods",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalInvoiceId",
                table: "Orders",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Paid",
                table: "Orders",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ProjectCode",
                table: "EventInfos",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminOnly",
                table: "PaymentMethods");

            migrationBuilder.DropColumn(
                name: "PaymentProvider",
                table: "PaymentMethods");

            migrationBuilder.DropColumn(
                name: "ExternalInvoiceId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Paid",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ProjectCode",
                table: "EventInfos");
        }
    }
}
