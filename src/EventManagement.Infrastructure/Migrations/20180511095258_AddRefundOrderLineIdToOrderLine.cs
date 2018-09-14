using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class AddRefundOrderLineIdToOrderLine : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RefundOrderLineId",
                table: "OrderLines",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_RefundOrderLineId",
                table: "OrderLines",
                column: "RefundOrderLineId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderLines_OrderLines_RefundOrderLineId",
                table: "OrderLines",
                column: "RefundOrderLineId",
                principalTable: "OrderLines",
                principalColumn: "OrderLineId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderLines_OrderLines_RefundOrderLineId",
                table: "OrderLines");

            migrationBuilder.DropIndex(
                name: "IX_OrderLines_RefundOrderLineId",
                table: "OrderLines");

            migrationBuilder.DropColumn(
                name: "RefundOrderLineId",
                table: "OrderLines");
        }
    }
}
