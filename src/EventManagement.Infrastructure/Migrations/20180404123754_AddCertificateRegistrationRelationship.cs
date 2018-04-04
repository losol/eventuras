using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class AddCertificateRegistrationRelationship : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RecipientUserId",
                table: "Certificate",
                newName: "Recipient_UserId");

            migrationBuilder.RenameColumn(
                name: "RecipientName",
                table: "Certificate",
                newName: "Recipient_Name");

            migrationBuilder.AlterColumn<string>(
                name: "Issuer_IssuedByName",
                table: "Certificate",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Recipient_UserId",
                table: "Certificate",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Recipient_RegistrationId",
                table: "Certificate",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Certificate_Recipient_RegistrationId",
                table: "Certificate",
                column: "Recipient_RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificate_Recipient_UserId",
                table: "Certificate",
                column: "Recipient_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificate_Registrations_Recipient_RegistrationId",
                table: "Certificate",
                column: "Recipient_RegistrationId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificate_AspNetUsers_Recipient_UserId",
                table: "Certificate",
                column: "Recipient_UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificate_Registrations_Recipient_RegistrationId",
                table: "Certificate");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificate_AspNetUsers_Recipient_UserId",
                table: "Certificate");

            migrationBuilder.DropIndex(
                name: "IX_Certificate_Recipient_RegistrationId",
                table: "Certificate");

            migrationBuilder.DropIndex(
                name: "IX_Certificate_Recipient_UserId",
                table: "Certificate");

            migrationBuilder.DropColumn(
                name: "Recipient_RegistrationId",
                table: "Certificate");

            migrationBuilder.RenameColumn(
                name: "Recipient_UserId",
                table: "Certificate",
                newName: "RecipientUserId");

            migrationBuilder.RenameColumn(
                name: "Recipient_Name",
                table: "Certificate",
                newName: "RecipientName");

            migrationBuilder.AlterColumn<string>(
                name: "Issuer_IssuedByName",
                table: "Certificate",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<string>(
                name: "RecipientUserId",
                table: "Certificate",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}
