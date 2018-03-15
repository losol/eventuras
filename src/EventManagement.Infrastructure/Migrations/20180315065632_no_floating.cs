using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class no_floating : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "ProductVariants",
                nullable: false,
                oldClrType: typeof(float));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "Price",
                table: "ProductVariants",
                nullable: false,
                oldClrType: typeof(decimal));
        }
    }
}
