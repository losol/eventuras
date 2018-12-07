using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class Productsupdate2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MaxOrdersCount",
                table: "ProductVariants",
                newName: "Inventory");

            migrationBuilder.RenameColumn(
                name: "MaxOrdersCount",
                table: "Products",
                newName: "Inventory");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Inventory",
                table: "ProductVariants",
                newName: "MaxOrdersCount");

            migrationBuilder.RenameColumn(
                name: "Inventory",
                table: "Products",
                newName: "MaxOrdersCount");
        }
    }
}
