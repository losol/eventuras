using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class products_availability : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MaxAttendees",
                table: "Products",
                newName: "MaxOrdersCount");

            migrationBuilder.AddColumn<int>(
                name: "MaxOrdersCount",
                table: "ProductVariants",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Published",
                table: "ProductVariants",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Published",
                table: "Products",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxOrdersCount",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "Published",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "Published",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "MaxOrdersCount",
                table: "Products",
                newName: "MaxAttendees");
        }
    }
}
