using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class AddRefundOrderReferenceField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RefundOrderId",
                table: "OrderLines",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_RefundOrderId",
                table: "OrderLines",
                column: "RefundOrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderLines_Orders_RefundOrderId",
                table: "OrderLines",
                column: "RefundOrderId",
                principalTable: "Orders",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderLines_Orders_RefundOrderId",
                table: "OrderLines");

            migrationBuilder.DropIndex(
                name: "IX_OrderLines_RefundOrderId",
                table: "OrderLines");

            migrationBuilder.DropColumn(
                name: "RefundOrderId",
                table: "OrderLines");
        }
    }
}
