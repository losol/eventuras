using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class eventsupdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CourseProvider",
                table: "EventInfos",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "EventInfos",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CourseProvider",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "EventInfos");
        }
    }
}
