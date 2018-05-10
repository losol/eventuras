using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class payupdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "PaymentMethods",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "PaymentMethods");
        }
    }
}
